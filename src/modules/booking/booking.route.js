import express from "express";
import {
  cancelBookingController,
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
router.post("/cancel/:id", cancelBookingController);

export default router;
