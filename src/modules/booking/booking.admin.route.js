import express from "express";
import {
  cancelBookingAdminController,
  getAllBookingsAdminController,
  getBookingByIdAdminController,
  updateBookingCustomerInfoAdminController,
  updateBookingStatusAdminController,
} from "./booking.admin.controller.js";

const router = express.Router();

router.get("/", getAllBookingsAdminController);
router.post("/cancel/:id", cancelBookingAdminController);
router.get("/:id", getBookingByIdAdminController);
router.patch("/:id", updateBookingCustomerInfoAdminController);
router.patch("/:id/status", updateBookingStatusAdminController);

export default router;
