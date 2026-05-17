import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";

export const findBookingByIdempotencyKeyRepository = async (idempotencyKey) => {
  return prisma.booking.findUnique({
    where: {
      idempotencyKey,
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
        discountAmount: 0,
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

export const findBookingByIdForCancelRepository = async (bookingId) => {
  return prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      bookingItems: true,
      voucher: true,
    },
  });
};

export const cancelBookingTransactionRepository = async (booking) => {
  return prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

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
    }

    return tx.booking.findUnique({
      where: {
        id: booking.id,
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
