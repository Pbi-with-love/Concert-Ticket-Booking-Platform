import crypto from "crypto";

export const generateTicketCode = () => {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `TK-${random}`;
};
