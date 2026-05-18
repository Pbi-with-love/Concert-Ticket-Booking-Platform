import prisma from "../../config/prisma.js";

export const findAttendeesByBookingIdRepository = async (bookingId) => {
  const bookingItems = await prisma.bookingItem.findMany({
    where: {
      bookingId,
    },
    include: {
      attendees: true,
    },
  });

  /**
   * [
   *    {
   *        attendees: [a1, a2]
   *    },
   *    {
   *        attendees: [a3]
   *    }
   * ]  -> need to flatten to [a1, a2, a3]
   */
  return bookingItems.flatMap((item) => item.attendees);
};

export const findAttendeeByTicketCodeRepository = async (ticketCode) => {
    const attendee = await prisma.attendee.findUnique({
        where: {
            ticketCode,
        }
    })

    return attendee;
}

export const markAttendeeCheckedInRepository = async (ticketCode) => {
  return prisma.attendee.updateMany({
    where: {
      ticketCode,
      checkInStatus: "PENDING",
    },
    data: {
      checkInStatus: "CHECKED_IN",
      checkInAt: new Date(),
    },
  });
};