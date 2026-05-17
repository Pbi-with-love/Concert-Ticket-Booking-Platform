import AppError from "../../utils/AppError.js";
import { generateBookingCode } from "../../utils/generateBookingCode.js";
import { toBookingDTO } from "../../utils/bookingDTO.js";
import {
  getBookingByCodeCache,
  getBookingByIdCache,
} from "./../../shared/redis/booking.cache.js";
import {
  createBookingTransactionRepository,
  findBookingByIdempotencyKeyRepository,
  findConcertByIdRepository,
  findMyBookingsRepository,
  findTicketCategoriesByConcertRepository,
  findVoucherByCodeRepository,
} from "./booking.repository.js";
/**
 * Create a booking
 *
 * Input example:
 * {
 *   customerEmail: "john@example.com",
 *   customerName: "John Doe",
 *   customerPhone: "0123456789",
 *   concertId: "uuid",
 *   voucherCode: "SUMMER10", // optional
 *   idempotencyKey: "unique-key-123",
 *   items: [
 *     {
 *       ticketCategoryId: "uuid",
 *       quantity: 2
 *     },
 *     {
 *       ticketCategoryId: "uuid",
 *       quantity: 1
 *     }
 *   ]
 * }
 */
export const createBookingService = async (payload) => {
  const {
    customerEmail,
    customerName,
    customerPhone,
    concertId,
    voucherCode,
    idempotencyKey,
    items,
  } = payload;

  if (!customerEmail || !concertId || !idempotencyKey) {
    throw new AppError(
      "customerEmail, concertId and idempotencyKey are required",
      400,
    );
  }

  if (!items || items.length === 0) {
    throw new AppError("Booking items are required", 400);
  }

  // Although already implement idempotency in redis, but in DB is more trustworthy
  const existingBooking =
    await findBookingByIdempotencyKeyRepository(idempotencyKey);

  // If a booking with the same idempotency key exists, return it instead of creating a new one
  if (existingBooking) {
    return toBookingDTO(existingBooking);
  }

  const concert = await findConcertByIdRepository(concertId);

  if (!concert) {
    throw new AppError("Concert not found", 404);
  }

  const ticketCategoryIds = items.map((item) => item.ticketCategoryId);

  // Validate ticket categories
  const ticketCategories = await findTicketCategoriesByConcertRepository(
    ticketCategoryIds,
    concertId,
  );

  if (ticketCategories.length !== ticketCategoryIds.length) {
    throw new AppError("One or more ticket categories are invalid", 400);
  }

  // Use map to prevent using find() inside the loop later, which would be O(n^2)
  const ticketCategoryMap = new Map(ticketCategories.map((tc) => [tc.id, tc]));

  // Validate stock and calculate subtotal
  let subtotal = 0;

  for (const item of items) {
    const ticketCategory = ticketCategoryMap.get(item.ticketCategoryId);

    if (item.quantity <= 0) {
      throw new AppError("Quantity must be greater than 0", 400);
    }

    if (ticketCategory.availableQuantity < item.quantity) {
      throw new AppError(
        `Not enough tickets for category ${ticketCategory.name}`,
        409,
      );
    }

    subtotal += Number(ticketCategory.price) * item.quantity;
  }

  // Validate voucher
  let voucher = null;
  let discountAmount = 0;

  if (voucherCode) {
    voucher = await findVoucherByCodeRepository(voucherCode);

    if (!voucher) {
      throw new AppError("Voucher not found", 404);
    }

    if (!voucher.isActive) {
      throw new AppError("Voucher is inactive", 400);
    }

    if (voucher.usedCount >= voucher.maxUsage) {
      throw new AppError("Voucher usage limit exceeded", 409);
    }

    const now = new Date();

    if (now < voucher.startDate || now > voucher.endDate) {
      throw new AppError("Voucher is expired or not started yet", 400);
    }

    if (voucher.discountType === "PERCENTAGE") {
      discountAmount = subtotal * (Number(voucher.discountValue) / 100);
    } else if (voucher.discountType === "FIXED") {
      discountAmount = Number(voucher.discountValue);
    }

    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }
  }

  // Final amount
  const finalAmount = subtotal - discountAmount;

  // Booking expiration time (15 minutes)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Database transaction
  const booking = await createBookingTransactionRepository({
    bookingCode: generateBookingCode(),
    customerEmail,
    customerName,
    customerPhone,
    concertId,
    voucherId: voucher?.id,
    subtotal,
    discountAmount,
    finalAmount,
    idempotencyKey,
    expiresAt,
    items,
    ticketCategoryMap,
    voucher,
  });

  return toBookingDTO(booking);
};

export const getBookingByCodeService = async (bookingCode) => {
  const booking = await getBookingByCodeCache(bookingCode);

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  return booking;
};

export const getBookingByIdService = async (bookingId) => {
  const booking = await getBookingByIdCache(bookingId);

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  return booking;
};

export const getMyBookingsService = async (customerEmail) => {
  const bookings = await findMyBookingsRepository(customerEmail);
  return bookings;
};

export const cancelBookingService = async (bookingId) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookingItems: {
          include: {
            ticketCategory: true,
          },
        },
        voucher: true,
      },
    });

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.status === "CANCELLED") {
      return booking;
    }

    const updated = await tx.booking.updateMany({
      where: {
        id: bookingId,
        status: {
          not: "CANCELLED",
        },
      },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    if (updated.count === 0) {
      // Another request has already cancelled this booking.
      // Return the current booking state without refunding tickets/voucher again.
      return tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          bookingItems: true,
          voucher: true,
        },
      });
    }

    for (const item of booking.bookingItems) {
      await tx.ticketCategory.update({
        where: {
          id: item.ticketCategoryId,
        },
        data: {
          availableQuantity: {
            increment: item.quantity,
          },
        },
      });
    }

    if (booking.voucherId) {
      await tx.voucher.updateMany({
        where: {
          id: booking.voucherId,
          usedCount: { gt: 0 },
        },
        data: {
          usedCount: { decrement: 1 },
        },
      });
    }

    return toBookingDTO({
      ...booking,
      status: "CANCELLED",
      cancelledAt: new Date(),
    });
  });
};
