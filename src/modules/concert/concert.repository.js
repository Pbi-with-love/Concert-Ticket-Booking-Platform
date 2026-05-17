import prisma from "../../config/prisma.js";

export const createConcertRepository = async ({
  name,
  venue,
  startTime,
  status,
  ticketCategories,
}) => {
  return prisma.concert.create({
    data: {
      name,
      venue,
      startTime,
      status,
      ticketCategories: ticketCategories.length
        ? {
            create: ticketCategories,
          }
        : undefined,
    },
    include: {
      ticketCategories: true,
    },
  });
};

export const findAllConcertIdsRepository = async () => {
  const concerts = await prisma.concert.findMany({
    select: {
      id: true,
    },
    orderBy: [
      {
        startTime: "asc",
      },
      {
        id: "asc",
      },
    ],
  });

  return concerts.map((concert) => concert.id);
};

export const findAllConcertsRepository = async () => {
  return prisma.concert.findMany({
    include: {
      ticketCategories: true,
    },
    // Always order by startTime asc, then by id asc (tie-breaker) to ensure consistent ordering
    // Without sorting id, it could happen at firstTime: A B C D E, thenTime: A C D E B.
    orderBy: [
      {
        startTime: "asc",
      },
      {
        id: "asc",
      },
    ],
  });
};

export const findConcertsByIdsRepository = async (concertIds) => {
  return prisma.concert.findMany({
    where: {
      id: {
        in: concertIds,
      },
    },
    include: {
      ticketCategories: true,
    },
  });
};

export const findConcertByIdRepository = async (concertId) => {
  return prisma.concert.findUnique({
    where: {
      id: concertId,
    },
    include: {
      ticketCategories: true,
    },
  });
};
