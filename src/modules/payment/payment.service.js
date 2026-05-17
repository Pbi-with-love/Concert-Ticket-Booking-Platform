import { ProductCode, VnpLocale } from "vnpay";
import prisma from "../../config/prisma.js";
import { vnpay } from "../../config/vnpay.js";
import AppError from "../../utils/AppError.js";
import { invalidateBookingCache } from "../../shared/redis/booking.cache.js";
import { generateTicketCode } from "../../utils/generateTicketCode.js";
import {
  confirmBookingIfPendingRepository,
  createAttendeesRepository,
  createPaymentRepository,
  findBookingForPaymentRepository,
  findPaymentForSuccessRepository,
  markBookingExpiredRepository,
  updatePaymentStatusRepository,
} from "./payment.repository.js";

// Mock ip address for testing. In production, you would get this from the request.
export const createPaymentUrlService = async ({
  bookingId,
  ipAddr = "127.0.0.1",
}) => {
  const result = await prisma.$transaction(async (tx) => {
    const booking = await findBookingForPaymentRepository(tx, bookingId);

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.status === "CONFIRMED") {
      throw new AppError("Booking has already been paid", 400);
    }

    if (booking.status === "CANCELLED") {
      throw new AppError("Booking has been cancelled", 400);
    }

    if (booking.status === "EXPIRED") {
      throw new AppError("Booking has expired", 400);
    }

    if (booking.expiresAt < new Date()) {
      await markBookingExpiredRepository(tx, booking.id);

      return {
        expired: true,
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
      };
    }

    // Check if there is already a pending payment for this booking. If yes, reuse it. Otherwise, create a new one.
    let payment = booking.payments.find((p) => p.status === "PENDING");

    if (!payment) {
      payment = await createPaymentRepository(tx, {
        bookingId: booking.id,
        provider: "VNPAY",
        transactionId: `VNPAY_${booking.bookingCode}_${Date.now()}`,
        amount: booking.finalAmount,
        status: "PENDING",
      });
    }

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: Number(payment.amount),
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: payment.transactionId,
      vnp_OrderInfo: `Payment for booking ${booking.bookingCode}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: "http://localhost:3000/vnpay-return",
      vnp_Locale: VnpLocale.VN,
    });

    return {
      paymentUrl,
      bookingCode: booking.bookingCode,
      paymentId: payment.id,
    };
  });

  if (result.expired) {
    await invalidateBookingCache({
      bookingId: result.bookingId,
      bookingCode: result.bookingCode,
    });

    throw new AppError("Booking has expired", 400);
  }

  return result;
};

/**
 * Because I allow to create multiple payments for a booking id, so it is possible to make 2 payment at the same time
 * and both of them are successful, which will cause the booking to be confirmed twice and create 2 attendees for the same booking.
 * To prevent this, I need to implement transaction + atomic update to ensure that only one payment can be successful and confirm the booking,
 * while the other payment will fail because the booking is no longer payable.
 * Booking B1
 * Payment P1 → URL 1
 * Payment P2 → URL 2
 * Payment P1 is successful → Booking B1 is confirmed
 * Payment P2 check that Booking B1 is already confirmed, so it should fail and not create attendees
 */
export const mockPaymentSuccessService = async (paymentId) => {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await findPaymentForSuccessRepository(tx, paymentId);

    if (!payment) {
      throw new AppError("Payment not found", 404);
    }

    if (payment.status === "SUCCESS") {
      return {
        payment,
        bookingId: payment.bookingId,
        bookingCode: payment.booking.bookingCode,
      };
    }

    if (payment.status !== "PENDING") {
      throw new AppError("Booking is not payable", 400);
    }

    // Atomically confirm the booking if it is still pending. If the booking is already confirmed by another payment, this update will fail and return count = 0
    const updatedBooking = await confirmBookingIfPendingRepository(
      tx,
      payment.bookingId,
    );

    if (updatedBooking.count === 0) {
      const failedPayment = await updatePaymentStatusRepository(tx, payment.id, {
        status: "FAILED",
      });

      return {
        failed: true,
        payment: failedPayment,
        bookingId: payment.bookingId,
        bookingCode: payment.booking.bookingCode,
      };
    }

    /**
     * Without flatmap:
     * const result = items.map((item) => 
     * Array.from({ length: item.quantity }, () => "ticket"));
     * [
     *    ["ticket", "ticket"],
     *    ["ticket", "ticket", "ticket"]
     * ]
     * 
     * With flatmap:
     * [
     *    "ticket",
     *    "ticket",
     *    "ticket",
     *    "ticket",  
     *    "ticket"
     * ]
     */
    const attendees = payment.booking.bookingItems.flatMap((item) =>
      Array.from({ length: item.quantity }, () => ({
        bookingItemId: item.id,
        ticketCategoryId: item.ticketCategoryId,
        ticketCode: generateTicketCode(),
        fullName: payment.booking.customerName,
        email: payment.booking.customerEmail,
        phone: payment.booking.customerPhone,
      })),
    );

    await createAttendeesRepository(tx, attendees);

    const updatedPayment = await updatePaymentStatusRepository(tx, paymentId, {
      status: "SUCCESS",
      paidAt: new Date(),
    });

    return {
      payment: updatedPayment,
      bookingId: payment.bookingId,
      bookingCode: payment.booking.bookingCode,
    };
  });

  await invalidateBookingCache({
    bookingId: result.bookingId,
    bookingCode: result.bookingCode,
  });

  if (result.failed) {
    throw new AppError("Booking is not payable", 400);
  }

  return result.payment;
};
