export const redisKeys = {
  idempotency: (key) => `idempotency:${key}`,
  idempotencyResult: (key) => `idempotency:result:${key}`,
  booking: (id) => `booking:${id}`,
};