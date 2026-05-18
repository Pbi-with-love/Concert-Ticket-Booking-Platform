import express from "express";
import { getAttendeesByBookingIdAdminController, getAttendeesByTicketCodeAdminController, checkInAttendeeAdminController} from "./attendee.admin.controller.js";

const router = express.Router();

router.get("/", getAttendeesByBookingIdAdminController);
router.get("/ticket/:ticketCode", getAttendeesByTicketCodeAdminController)
router.post("/check-in", checkInAttendeeAdminController)

export default router;