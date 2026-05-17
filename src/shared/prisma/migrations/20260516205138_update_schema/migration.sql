/*
  Warnings:

  - You are about to drop the column `discountAmount` on the `BookingItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "subtotal" SET DEFAULT 0,
ALTER COLUMN "finalAmount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "BookingItem" DROP COLUMN "discountAmount";

-- CreateIndex
CREATE INDEX "Booking_customerEmail_idx" ON "Booking"("customerEmail");

-- CreateIndex
CREATE INDEX "Booking_concertId_idx" ON "Booking"("concertId");

-- CreateIndex
CREATE INDEX "BookingItem_bookingId_idx" ON "BookingItem"("bookingId");

-- CreateIndex
CREATE INDEX "BookingItem_ticketCategoryId_idx" ON "BookingItem"("ticketCategoryId");
