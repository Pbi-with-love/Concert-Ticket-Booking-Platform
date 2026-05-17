import { withIdempotency } from "../../shared/redis/idempotency.cache.js";
import {
  cancelBookingService,
  getBookingByCodeService,
  getBookingByIdService,
  getMyBookingsService,
} from "./booking.service.js";

export const createBookingController = async (req, res, next) => {
  try {
    const booking = await withIdempotency(req.body.idempotencyKey, req.body);
    res.status(201).json({
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingByCodeController = async (req, res, next) => {
  try {
    const booking = await getBookingByCodeService(req.params.bookingCode);
    res.status(200).json({
      message: "Booking fetched successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookingsController = async (req, res, next) => {
  try {
    // Req.user is set by auth middleware, but we also allow customerEmail as query param for flexibility
    const customerEmail = req.user?.email || req.query.customerEmail;
    const bookings = await getMyBookingsService(customerEmail);

    res.status(200).json({
      message: "Bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingByIdController = async (req, res, next) => {
  try {
    const booking = await getBookingByIdService(req.params.id);
    res.status(200).json({
      message: "Booking fetched successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Admin controller for cancelling a booking and user controller for cancelling their own booking.
export const cancelBookingController = async (req, res, next) => {
  try {
    const booking = await cancelBookingService(req.params.id, {
      allowedStatuses: ["PENDING"],
    });
    res.status(200).json({
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
