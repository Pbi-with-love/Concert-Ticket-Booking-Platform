import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";
import { generateBookingCode } from "../../utils/generateBookingCode.js";

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

  const existingBooking = await prisma.booking.findUnique({
    where: {
      idempotencyKey,
    },
    include: {
      bookingItems: true,
      payments: true,
    },
  });

  // If a booking with the same idempotency key exists, return it instead of creating a new one
  if (existingBooking) {
    return existingBooking;
  }

  const concert = await prisma.concert.findUnique({
    where: {
      id: concertId,
    },
  });

  if (!concert) {
    throw new AppError("Concert not found", 404);
  }

  const ticketCategoryIds = items.map((item) => item.ticketCategoryId);

  // Validate ticket categories
  const ticketCategories = await prisma.ticketCategory.findMany({
    where: {
      id: {
        in: ticketCategoryIds,
      },
      concertId,
    },
  });

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
    voucher = await prisma.voucher.findUnique({
      where: {
        code: voucherCode,
      },
    });

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
  const booking = await prisma.$transaction(async (tx) => {
    // Create booking
    const createdBooking = await tx.booking.create({
      data: {
        bookingCode: generateBookingCode(),
        customerEmail,
        customerName,
        customerPhone,
        concertId,
        voucherId: voucher?.id,
        status: "PENDING",
        subtotal,
        discountAmount,
        finalAmount,
        idempotencyKey,
        expiresAt,
      },
    });

    // Create booking items + update stock safely by using atomic operations in the same transaction
    const bookingItemsData = [];
    for (const item of items) {
      const ticketCategory = ticketCategories.get(item.ticketCategoryId);

      if (!ticketCategory) {
        throw new AppError(
          `Ticket category not found: ${item.ticketCategoryId}`,
          404,
        );
      }

      if (item.quantity <= 0) {
        throw new AppError("Quantity must be greater than 0", 400);
      }

      // 2. Atomic stock update (anti oversell)
      const updated = await tx.ticketCategory.updateMany({
        where: {
          id: item.ticketCategoryId,
          availableQuantity: {
            gte: item.quantity,
          },
        },
        data: {
          availableQuantity: {
            decrement: item.quantity,
          },
        },
      });

      if (updated.count === 0) {
        throw new AppError(
          `Not enough tickets for category ${ticketCategory.name}`,
          409,
        );
      }

      const unitPrice = Number(ticketCategory.price);
      const lineTotal = unitPrice * item.quantity;

      bookingItemsData.push({
        bookingId: createdBooking.id,
        ticketCategoryId: item.ticketCategoryId,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        discountAmount: 0,
      });
    }

    await tx.bookingItem.createMany({
      data: bookingItemsData,
    });

    // Increase voucher usage
    if (voucher) {
      await tx.voucher.update({
        where: {
          id: voucher.id,
        },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    // Return full booking
    return tx.booking.findUnique({
      where: {
        id: createdBooking.id,
      },
      include: {
        bookingItems: {
          include: {
            ticketCategory: true,
          },
        },
        voucher: true,
      },
    });
  });

  return booking;
};

export const getBookingByCode = async (bookingCode) => {

};
