import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";

export const findBookingByIdempotencyKeyRepository = async (idempotencyKey) => {
  return prisma.booking.findUnique({
    where: {
      idempotencyKey,
    },
  });
};

export const findConcertByIdRepository = async (concertId) => {
  return prisma.concert.findUnique({
    where: {
      id: concertId,
    },
  });
};

export const findTicketCategoriesByConcertRepository = async (
  ticketCategoryIds,
  concertId,
) => {
  return prisma.ticketCategory.findMany({
    where: {
      id: {
        in: ticketCategoryIds,
      },
      concertId,
    },
  });
};

export const findVoucherByCodeRepository = async (voucherCode) => {
  return prisma.voucher.findUnique({
    where: {
      code: voucherCode,
    },
  });
};

export const createBookingTransactionRepository = async ({
  bookingCode,
  customerEmail,
  customerName,
  customerPhone,
  concertId,
  voucherId,
  subtotal,
  discountAmount,
  finalAmount,
  idempotencyKey,
  expiresAt,
  items,
  ticketCategoryMap,
  voucher,
}) => {
  return prisma.$transaction(async (tx) => {
    const createdBooking = await tx.booking.create({
      data: {
        bookingCode,
        customerEmail,
        customerName,
        customerPhone,
        concertId,
        voucherId,
        status: "PENDING",
        subtotal,
        discountAmount,
        finalAmount,
        idempotencyKey,
        expiresAt,
      },
    });

    const bookingItemsData = [];

    for (const item of items) {
      const ticketCategory = ticketCategoryMap.get(item.ticketCategoryId);

      if (!ticketCategory) {
        throw new AppError(
          `Ticket category not found: ${item.ticketCategoryId}`,
          404,
        );
      }

      if (item.quantity <= 0) {
        throw new AppError("Quantity must be greater than 0", 400);
      }

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
      });
    }

    await tx.bookingItem.createMany({
      data: bookingItemsData,
    });

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
};

export const findMyBookingsRepository = async (customerEmail) => {
  return prisma.booking.findMany({
    where: {
      customerEmail,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    skip: 0,
    select: {
      id: true,
      bookingCode: true,
      status: true,
      finalAmount: true,
      createdAt: true,
    },
  });
};

export const markBookingCancelledIfNotCancelledRepository = async (
  tx,
  bookingId,
) => {
  return tx.booking.updateMany({
    where: {
      id: bookingId,
      status: {
        not: "CANCELLED",
      },
    },
    data: {
      status: "CANCELLED",
    },
  });
};

export const incrementTicketCategoryAvailableQuantityRepository = async (
  tx,
  ticketCategoryId,
  quantity,
) => {
  return tx.ticketCategory.update({
    where: {
      id: ticketCategoryId,
    },
    data: {
      availableQuantity: {
        increment: quantity,
      },
    },
  });
};

export const decrementVoucherUsedCountIfPositiveRepository = async (
  tx,
  voucherId,
) => {
  return tx.voucher.updateMany({
    where: {
      id: voucherId,
      usedCount: {
        gt: 0,
      },
    },
    data: {
      usedCount: {
        decrement: 1,
      },
    },
  });
};

export const findBookingByIdRepository = async (tx, bookingId) => {
  return tx.booking.findUnique({
    where: {
      id: bookingId,
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
};

const bookingAdminInclude = {
  concert: true,
  voucher: true,
  bookingItems: {
    include: {
      ticketCategory: true,
    },
  },
  payments: true,
};

/**
 * Filter is a full obj (status, concertId, customerEmail).
 * Therefore we can directly spread it in the where clause.
 */
export const findAllBookingsRepository = async (filters = {}) => {
  return prisma.booking.findMany({
    where: {
      ...filters,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      concert: true,
      voucher: true,
      bookingItems: {
        include: {
          ticketCategory: true,
        },
      },
      payments: true,
    },
  });
};

export const findBookingByIdAdminRepository = async (bookingId) => {
  return prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      concert: true,
      voucher: true,
      bookingItems: {
        include: {
          ticketCategory: true,
        },
      },
      payments: true,
    },
  });
};

export const updateBookingStatusAdminRepository = async (bookingId, status) => {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status,
    },
    include: {
      concert: true,
      voucher: true,
      bookingItems: {
        include: {
          ticketCategory: true,
        },
      },
      payments: true,
    },
  });
};

export const updateBookingCustomerInfoAdminRepository = async (
  bookingId,
  data,
) => {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data,
    include: {
      concert: true,
      voucher: true,
      bookingItems: {
        include: {
          ticketCategory: true,
        },
      },
      payments: true,
    },
  });
};
