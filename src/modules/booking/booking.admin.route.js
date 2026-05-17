import express from "express";
import {
  cancelBookingAdminController,
} from "./booking.admin.controller.js";

const router = express.Router();

router.post("/cancel/:id", cancelBookingAdminController);

export default router;
