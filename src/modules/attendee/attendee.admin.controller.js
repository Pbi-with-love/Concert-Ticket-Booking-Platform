import {
  getAttendeesByBookingIdService,
  getAttendeeByTicketCodeService,
  checkInAttendeeService,
} from "./attendee.admin.service.js";

export const getAttendeesByBookingIdAdminController = async (
  req,
  res,
  next,
) => {
  try {
    const bookingId = req.query.bookingId;
    const attendees = await getAttendeesByBookingIdService(bookingId);
    res.status(200).json({
      message: "Attendees fetched successfully",
      data: attendees,
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendeesByTicketCodeAdminController = async (
  req,
  res,
  next,
) => {
  try {
    const { ticketCode } = req.params;

    const attendees = await getAttendeeByTicketCodeService(ticketCode);
    res.status(200).json({
      message: "Attendees fetched successfully",
      data: attendees,
    });
  } catch (error) {
    next(error);
  }
};

export const checkInAttendeeAdminController = async (req, res, next) => {
  try {
    const { ticketCode } = req.body;

    const attendee = await checkInAttendeeService(ticketCode);

    res.status(200).json({
      message: "Attendee checked in successfully",
      data: attendee,
    });
  } catch (error) {
    next(error);
  }
};
