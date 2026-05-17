import express from "express";
import { swaggerServe, swaggerSetup } from "./config/swagger.js";
import errorHandler from "./middlewares/errorHandlers.js";
import bookingRouter from "./modules/booking/booking.route.js";
import concertAdminRouter from "./modules/concert/concert.admin.route.js";
import concertRouter from "./modules/concert/concert.route.js";
import ticketCategoryAdminRouter from "./modules/ticket-category/ticketCategory.admin.route.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api-docs", swaggerServe, swaggerSetup);
app.use("/api/bookings", bookingRouter);
app.use("/api/admin/concerts", concertAdminRouter);
app.use("/api/admin/ticket-categories", ticketCategoryAdminRouter);
app.use("/api/concerts", concertRouter);

app.use(errorHandler);

export default app;
