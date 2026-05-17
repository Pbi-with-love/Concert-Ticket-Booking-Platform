export const findBookingForPaymentRepository = async (tx, bookingId) => {
  return tx.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      payments: true,
    },
  });
};

export const markBookingExpiredRepository = async (tx, bookingId) => {
  return tx.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: "EXPIRED",
    },
  });
};

export const createPaymentRepository = async (tx, data) => {
  return tx.payment.create({
    data,
  });
};

export const findPaymentForSuccessRepository = async (tx, paymentId) => {
  return tx.payment.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      booking: {
        include: {
          bookingItems: true,
        },
      },
    },
  });
};

export const confirmBookingIfPendingRepository = async (tx, bookingId) => {
  return tx.booking.updateMany({
    where: {
      id: bookingId,
      status: "PENDING",
    },
    data: {
      status: "CONFIRMED",
    },
  });
};

export const updatePaymentStatusRepository = async (tx, paymentId, data) => {
  return tx.payment.update({
    where: {
      id: paymentId,
    },
    data,
  });
};

export const createAttendeesRepository = async (tx, attendees) => {
  if (!attendees.length) {
    return;
  }

  return tx.attendee.createMany({
    data: attendees,
  });
};
