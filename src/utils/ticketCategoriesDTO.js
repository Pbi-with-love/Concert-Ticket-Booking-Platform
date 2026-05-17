export const toTicketCategoriesDTO = (ticketCategories) => {
  return ticketCategories.map((ticketCategory) => ({
    id: ticketCategory.id,
    concertId: ticketCategory.concertId,
    name: ticketCategory.name,
    price: Number(ticketCategory.price),
    totalQuantity: ticketCategory.totalQuantity,
    availableQuantity: ticketCategory.availableQuantity,
  }));
};