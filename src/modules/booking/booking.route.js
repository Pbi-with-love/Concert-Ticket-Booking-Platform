
import express from "express"

const router = express.Router();

router.post("/", createBooking);
router.get("/code/:bookingCode", getBookingByCode);
router.get("/me", getMyBookings);
router.get("/:id", getBookingById);
router.post("/cancel/:id", cancelBooking);

export default router;