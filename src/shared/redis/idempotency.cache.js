import redis from "../../config/redis.js";
import { redisKeys } from "../../utils/redisKey.js";
import AppError from "../../utils/AppError.js";
import { createBooking } from "../../modules/booking/booking.service.js";


export const withIdempotency = async (idempotencyKey, payload) => {
  const lockKey = redisKeys.idempotency(idempotencyKey);
  const resultKey = redisKeys.idempotencyResult(idempotencyKey);

  const lockAcquired = await redis.set(lockKey, "processing", "NX", "EX", 60);

  if (!lockAcquired) {
    const cached = await redis.get(resultKey);
    if (cached) return JSON.parse(cached);

    throw new AppError("Request already in progress", 409);
  }

  try {
    const booking = await createBooking(payload);

    await redis.set(
      resultKey,
      JSON.stringify(booking),
      "EX",
      300
    );

    return booking;
  } finally {
    await redis.del(lockKey);
  }
};
