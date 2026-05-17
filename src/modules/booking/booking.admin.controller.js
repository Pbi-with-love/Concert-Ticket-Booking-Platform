import {
  cancelBookingService,
} from "./booking.service.js";

export const cancelBookingAdminController = async (req, res, next) => {
  try {
    const booking = await cancelBookingService(req.params.id);

    res.status(200).json({
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
