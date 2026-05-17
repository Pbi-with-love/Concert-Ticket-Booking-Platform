export const toConcertDTO = (concert) => {
  return {
    id: concert.id,
    name: concert.name,
    venue: concert.venue,
    startTime: concert.startTime,
    status: concert.status,
    ticketCategories: concert.ticketCategories.map((ticketCategory) => ({
      id: ticketCategory.id,
      concertId: ticketCategory.concertId,
      name: ticketCategory.name,
      price: Number(ticketCategory.price),
      totalQuantity: ticketCategory.totalQuantity,
      availableQuantity: ticketCategory.availableQuantity,
    })),
  };
};
