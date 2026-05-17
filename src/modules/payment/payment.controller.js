import {
  createPaymentUrlService,
  mockPaymentSuccessService,
} from "./payment.service.js";

export const createPaymentUrlController = async (req, res, next) => {
  try {
    const result = await createPaymentUrlService({
      bookingId: req.body.bookingId,
      ipAddr: req.ip,
    });

    res.status(201).json({
      message: "Payment URL created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const mockPaymentSuccessController = async (req, res, next) => {
  try {
    const payment = await mockPaymentSuccessService(req.params.id);

    res.status(200).json({
      message: "Payment marked as successful",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};