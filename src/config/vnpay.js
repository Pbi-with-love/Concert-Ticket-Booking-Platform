import { VNPay, ignoreLogger } from "vnpay";
import dotenv from "dotenv";

dotenv.config();

export const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE,
  secureSecret: process.env.VNPAY_SECURE_SECRET,

  vnpayHost: "https://sandbox.vnpayment.vn",

  testMode: true,

  hashAlgorithm: "SHA512",

  enableLog: false,
  loggerFn: ignoreLogger,
});