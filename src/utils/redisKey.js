export const redisKeys = {
  idempotency: (key) => `idempotency:${key}`,
  idempotencyResult: (key) => `idempotency:result:${key}`,
  bookingByCode: (code) => `booking:code:${code}`,
  bookingById: (id) => `booking:id:${id}`,
  concertById: (id) => `concert:id:${id}`,
  ticketCategoriesByConcertId: (concertId) =>
    `concert:${concertId}:ticket-categories`,
  allConcerts: () => "concert:all",
};
