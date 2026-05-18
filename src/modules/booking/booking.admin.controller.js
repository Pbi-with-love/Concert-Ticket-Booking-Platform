import {
  cancelBookingService,
  getAllBookingsService,
  getBookingByIdAdminService,
  updateBookingStatusAdminService,
  updateBookingCustomerInfoAdminService,
} from "./booking.service.js";

export const cancelBookingAdminController = async (req, res, next) => {
  try {
    const booking = await cancelBookingService(req.params.id, {
        allowedStatuses: ["PENDING", "CONFIRMED"], // Admin can cancel PENDING, CONFIRMED bookings
    });

    res.status(200).json({
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookingsAdminController = async (req, res, next) => {
  try {
    const { concertId, status, customerEmail } = req.query;
    const bookings = await getAllBookingsService({
      concertId,
      status,
      customerEmail,
    });

    res.status(200).json({
      message: "Bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingByIdAdminController = async (req, res, next) => {
  try {
    const booking = await getBookingByIdAdminService(req.params.id);

    res.status(200).json({
      message: "Booking fetched successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatusAdminController = async (req, res, next) => {
  try {
    const booking = await updateBookingStatusAdminService(
      req.params.id,
      req.body.status,
    );

    res.status(200).json({
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingCustomerInfoAdminController = async (
  req,
  res,
  next,
) => {
  try {
    const booking = await updateBookingCustomerInfoAdminService(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      message: "Booking customer info updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
