import express from "express";
import {
  createPaymentUrlController,
  mockPaymentSuccessController,
} from "./payment.controller.js";

const router = express.Router();

router.post("/url", createPaymentUrlController);
router.post("/:id/mock-success", mockPaymentSuccessController);

export default router;
