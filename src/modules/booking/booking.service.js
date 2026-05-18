import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";
import { generateBookingCode } from "../../utils/generateBookingCode.js";
import { toBookingDTO } from "../../utils/bookingDTO.js";
import {
  invalidateBookingCache,
  getBookingByCodeCache,
  getBookingByIdCache,
} from "./../../shared/redis/booking.cache.js";
import {
  createBookingTransactionRepository,
  decrementVoucherUsedCountIfPositiveRepository,
  findAllBookingsRepository,
  findBookingByIdAdminRepository,
  findBookingByIdempotencyKeyRepository,
  findBookingByIdRepository,
  findConcertByIdRepository,
  findMyBookingsRepository,
  findTicketCategoriesByConcertRepository,
  findVoucherByCodeRepository,
  incrementTicketCategoryAvailableQuantityRepository,
  markBookingCancelledIfNotCancelledRepository,
  updateBookingStatusAdminRepository,
  updateBookingCustomerInfoAdminRepository,
} from "./booking.repository.js";
import { invalidateTicketCategoriesByConcertIdCache } from "../../shared/redis/concert.cache.js";

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

  await invalidateTicketCategoriesByConcertIdCache(concertId);

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

// Allowstatus is an optional parameter to specify if user use this service only to cancel pending booking
// Limitation for admin, admin can cancel ["PENDING", "CONFIRMED"] booking, but cannot cancel EXPIRED, CANCELLED booking.
// but user can only cancel pending booking.
// So when user call this service, we will pass allowedStatuses: ["PENDING"], but when admin call this service, we will not pass allowedStatuses, so it will allow cancelling booking in any status except already cancelled.
export const cancelBookingService = async (bookingId, options = {}) => {
  const { allowedStatuses } = options;

  const result = await prisma.$transaction(async (tx) => {
    const booking = await findBookingByIdRepository(tx, bookingId);

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (allowedStatuses && !allowedStatuses.includes(booking.status)) {
      throw new AppError("Booking cannot be cancelled in current status", 400);
    }

    if (booking.status === "CANCELLED") {
      return {
        booking,
        cancelled: false,
      };
    }

    const updated = await markBookingCancelledIfNotCancelledRepository(
      tx,
      bookingId,
    );

    if (updated.count === 0) {
      const currentBooking = await findBookingByIdRepository(tx, bookingId);

      return {
        booking: currentBooking,
        cancelled: false,
      };
    }

    for (const item of booking.bookingItems) {
      await incrementTicketCategoryAvailableQuantityRepository(
        tx,
        item.ticketCategoryId,
        item.quantity,
      );
    }

    if (booking.voucherId) {
      await decrementVoucherUsedCountIfPositiveRepository(
        tx,
        booking.voucherId,
      );
    }

    const cancelledBooking = await findBookingByIdRepository(tx, bookingId);

    return {
      booking: cancelledBooking,
      cancelled: true,
    };
  });

  if (result.cancelled) {
    await invalidateBookingCache({
      bookingId: result.booking.id,
      bookingCode: result.booking.bookingCode,
    });

    // Invalidate ticket category cache for the concert to reflect the updated available quantity
    await invalidateTicketCategoriesByConcertIdCache(result.booking.concertId);
  }

  return toBookingDTO(result.booking);
};

export const getAllBookingsService = async (filters = {}) => {
  if (
    filters.status &&
    !["PENDING", "CONFIRMED", "CANCELLED", "EXPIRED"].includes(filters.status)
  ) {
    throw new AppError("Invalid booking status", 400);
  }

  const bookings = await findAllBookingsRepository(filters);
  return bookings;
};

export const getBookingByIdAdminService = async (bookingId) => {
  const booking = await findBookingByIdAdminRepository(bookingId);

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  return booking;
};

/**
 * Only admin can update booking status, and admin can update status to PENDING, CONFIRMED, CANCELLED. But cannot update status of a expired, cancel booking to pending.
 * It is possible to update booking status from PENDING to CONFIRMED, or from CONFIRMED to CANCELLED. But it is not possible to update booking status from CANCELLED or EXPIRED to any other status, or from CONFIRMED to PENDING.
 */
export const updateBookingStatusAdminService = async (bookingId, status) => {
  if (!status) {
    throw new AppError("status is required", 400);
  }

  // Admin can update status to PENDING, CONFIRMED, CANCELLED. But cannot update status of a expired, cancel booking to pending.
  if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
    throw new AppError("Invalid booking status", 400);
  }

  if (status === "CANCELLED") {
    return cancelBookingService(bookingId, {
      // Admin can cancel PENDING, CONFIRMED booking, but cannot cancel EXPIRED, CANCELLED booking.
      allowedStatuses: ["PENDING", "CONFIRMED"],
    });
  }

  const existingBooking = await findBookingByIdAdminRepository(bookingId);

  if (!existingBooking) {
    throw new AppError("Booking not found", 404);
  }

  if (existingBooking.status === "CANCELLED") {
    throw new AppError("Cannot update status of a cancelled booking", 400);
  }

  if (existingBooking.status === "EXPIRED") {
    throw new AppError("Cannot update status of an expired booking", 400);
  }

  if (status === "PENDING" && existingBooking.status !== "PENDING") {
    throw new AppError("Cannot move booking back to PENDING", 400);
  }

  const booking = await updateBookingStatusAdminRepository(bookingId, status);

  await invalidateBookingCache({
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
  });

  return booking;
};

export const updateBookingCustomerInfoAdminService = async (
  bookingId,
  payload = {},
) => {
  const allowedFields = ["customerName", "customerPhone", "customerEmail"];
  const payloadFields = Object.keys(payload);
  const invalidFields = payloadFields.filter(
    (field) => !allowedFields.includes(field),
  );

  if (invalidFields.length > 0) {
    throw new AppError(
      `Only customerName, customerPhone and customerEmail can be updated`,
      400,
    );
  }

  const data = {};

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      data[field] = payload[field];
    }
  }

  if (Object.keys(data).length === 0) {
    throw new AppError("At least one customer field is required", 400);
  }

  const existingBooking = await findBookingByIdAdminRepository(bookingId);

  if (!existingBooking) {
    throw new AppError("Booking not found", 404);
  }

  const booking = await updateBookingCustomerInfoAdminRepository(
    bookingId,
    data,
  );

  await invalidateBookingCache({
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
  });

  return booking;
};
