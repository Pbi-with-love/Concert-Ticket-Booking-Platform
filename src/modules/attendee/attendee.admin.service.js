import AppError from "../../utils/AppError.js";
import {
  findAttendeesByBookingIdRepository,
  findAttendeeByTicketCodeRepository,
  markAttendeeCheckedInRepository,
  findAttendeesByConcertIdRepository
} from "./attendee.admin.repository.js";

export const getAttendeesByBookingIdService = async (bookingId) => {
  const attendees = await findAttendeesByBookingIdRepository(bookingId);

  if (!attendees) {
    throw new AppError("Attendee not found", 404);
  }
  return attendees;
};

export const getAttendeeByTicketCodeService = async (ticketCode) => {
  const attendee = await findAttendeeByTicketCodeRepository(ticketCode);

  if (!attendee) {
    throw new AppError("Attendee not found", 404);
  }
  return attendee;
};

export const checkInAttendeeService = async (ticketCode) => {
  const attendee = await findAttendeeByTicketCodeRepository(ticketCode);

  if (!attendee) {
    throw new AppError("Attendee not found", 404);
  }

  if (attendee.checkInStatus === "CHECKED_IN") {
    throw new AppError("Ticket already checked in", 409);
  }

  const updated = await markAttendeeCheckedInRepository(ticketCode);

  if (updated.count === 0) {
    throw new AppError("Ticket already checked in", 409);
  }

  const checkedInAttendee = await findAttendeeByTicketCodeRepository(ticketCode);

  return checkedInAttendee;
};


export const getAttendeesByConcertIdService = async (concertId) => {
    const attendees = await findAttendeesByConcertIdRepository(concertId);

    return attendees;
}