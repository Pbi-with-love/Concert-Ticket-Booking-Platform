import express from "express";
import errorHandler from "./middlewares/errorHandler.js";
import bookingRouter from "./modules/booking/booking.route.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/bookings", bookingRouter);

app.use(errorHandler);

export default app;