import prisma from "../../config/prisma.js";

export const createTicketCategoryRepository = async (data) => {
  return prisma.ticketCategory.create({
    data,
    include: {
      concert: true,
    },
  });
};

// If concertId is provided, filter by it. Otherwise, return all ticket categories.
export const findAllTicketCategoriesRepository = async (concertId) => {
  return prisma.ticketCategory.findMany({
    where: concertId
      ? {
          concertId,
        }
      : undefined,
    include: {
      concert: true,
    },
    orderBy: [
      {
        concertId: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
};

export const findTicketCategoryByIdRepository = async (ticketCategoryId) => {
  return prisma.ticketCategory.findUnique({
    where: {
      id: ticketCategoryId,
    },
    include: {
      concert: true,
      bookingItems: true,
      attendees: true,
    },
  });
};

export const updateTicketCategoryRepository = async (ticketCategoryId, data) => {
  return prisma.ticketCategory.update({
    where: {
      id: ticketCategoryId,
    },
    data,
    include: {
      concert: true,
    },
  });
};

export const deleteTicketCategoryRepository = async (ticketCategoryId) => {
  return prisma.ticketCategory.delete({
    where: {
      id: ticketCategoryId,
    },
  });
};

export const findConcertByIdForTicketCategoryRepository = async (concertId) => {
  return prisma.concert.findUnique({
    where: {
      id: concertId,
    },
  });
};
