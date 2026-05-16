export const toBookingDTO = (booking) => {
  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    concertId: booking.concertId,
    status: booking.status,
    subtotal: booking.subtotal,
    discountAmount: booking.discountAmount,
    finalAmount: booking.finalAmount,
    expiresAt: booking.expiresAt,

    voucher: booking.voucher
      ? {
          code: booking.voucher.code,
          discountType: booking.voucher.discountType,
          discountValue: booking.voucher.discountValue,
        }
      : null,

    items: booking.bookingItems.map((item) => ({
      id: item.id,
      ticketCategoryId: item.ticketCategoryId,
      ticketCategoryName: item.ticketCategory.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
  };
};