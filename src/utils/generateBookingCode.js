import crypto from "crypto";

export const generateBookingCode = () => {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `BK-${random}`;
};