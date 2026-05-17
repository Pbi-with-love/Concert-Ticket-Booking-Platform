import express from "express";
import {
  cancelBooking,
  createBookingController,
  getBookingByCodeController,
  getBookingByIdController,
  getMyBookingsController,
} from "./booking.controller.js";

const router = express.Router();

router.post("/", createBookingController);
router.get("/code/:bookingCode", getBookingByCodeController);
router.get("/me", getMyBookingsController);
router.get("/:id", getBookingByIdController);
router.post("/cancel/:id", cancelBooking);

export default router;
