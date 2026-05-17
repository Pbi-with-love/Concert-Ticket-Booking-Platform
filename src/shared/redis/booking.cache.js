import { redisKeys } from "../../utils/redisKey.js";
import prisma from "../../config/prisma.js";
import redis from "../../config/redis.js";
import { toBookingDTO } from "../../utils/bookingDTO.js";

export const getBookingByCodeCache = async (bookingCode) => {
  const key = redisKeys.bookingByCode(bookingCode);
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const booking = await prisma.booking.findUnique({
    where: {
      bookingCode: bookingCode,
    },
    include: {
      bookingItems: {
        include: {
          ticketCategory: true,
        },
      },
      voucher: true,
    },
  });

  if (!booking) return null;

  const dto = toBookingDTO(booking);

  await redis.set(key, JSON.stringify(dto), "EX", 120);

  return dto;
};

export const getBookingByIdCache = async (bookingId) => {
  const key = redisKeys.bookingById(bookingId);
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      bookingItems: {
        include: {
          ticketCategory: true,
        },
      },
      voucher: true,
    },
  });

  if (!booking) return null;
  const dto = toBookingDTO(booking);

  await redis.set(key, JSON.stringify(dto), "EX", 120);

  return dto;
};

export const invalidateBookingCache = async ({ bookingId, bookingCode }) => {
  const keys = [];

  if (bookingId) {
    keys.push(redisKeys.bookingById(bookingId));
  }

  if (bookingCode) {
    keys.push(redisKeys.bookingByCode(bookingCode));
  }

  if (keys.length > 0) {
    await redis.del(keys);
  }
};
