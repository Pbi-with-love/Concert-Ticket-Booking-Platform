import AppError from "../../utils/AppError.js";
import {
  createConcertRepository,
  deleteConcertRepository,
  findConcertByIdForAdminRepository,
  updateConcertRepository,
} from "./concert.repository.js";
import {
  getAllConcertsCache,
  getConcertByIdCache,
  getTicketCategoriesByConcertIdCache,
  invalidateAllConcertsCache,
  invalidateConcertCache
} from "../../shared/redis/concert.cache.js";

export const createConcertService = async (payload) => {
  const {
    name,
    venue,
    startTime,
    status,
    ticketCategories = [],
  } = payload;

  if (!name || !venue || !startTime || !status) {
    throw new AppError("name, venue, startTime and status are required", 400);
  }

  const parsedStartTime = new Date(startTime);

  if (Number.isNaN(parsedStartTime.getTime())) {
    throw new AppError("startTime must be a valid datetime", 400);
  }

  if (!Array.isArray(ticketCategories)) {
    throw new AppError("ticketCategories must be an array", 400);
  }

  const normalizedTicketCategories = ticketCategories.map((category, index) => {
    const {
      name: categoryName,
      price,
      totalQuantity,
      availableQuantity,
    } = category;

    if (!categoryName) {
      throw new AppError(
        `ticketCategories[${index}].name is required`,
        400,
      );
    }

    if (price === undefined || Number(price) < 0) {
      throw new AppError(
        `ticketCategories[${index}].price must be greater than or equal to 0`,
        400,
      );
    }

    if (!Number.isInteger(totalQuantity) || totalQuantity < 0) {
      throw new AppError(
        `ticketCategories[${index}].totalQuantity must be a non-negative integer`,
        400,
      );
    }

    if (!Number.isInteger(availableQuantity) || availableQuantity < 0) {
      throw new AppError(
        `ticketCategories[${index}].availableQuantity must be a non-negative integer`,
        400,
      );
    }

    if (availableQuantity > totalQuantity) {
      throw new AppError(
        `ticketCategories[${index}].availableQuantity cannot exceed totalQuantity`,
        400,
      );
    }

    return {
      name: categoryName,
      price: Number(price),
      totalQuantity,
      availableQuantity,
    };
  });

  const concert = await createConcertRepository({
    name,
    venue,
    startTime: parsedStartTime,
    status,
    ticketCategories: normalizedTicketCategories,
  });

  await invalidateAllConcertsCache();

  return concert;
};


export const getAllConcertsService = async () => {
  return getAllConcertsCache();
};

export const getConcertByIdService = async (concertId) => {
  const concert = await getConcertByIdCache(concertId);

  if (!concert) {
    throw new AppError("Concert not found", 404);
  }

  return concert;
};

export const getTicketCategoriesByConcertIdService = async (concertId) => {
  const ticketCategories = await getTicketCategoriesByConcertIdCache(concertId);

  if (!ticketCategories) {
    throw new AppError("Concert not found", 404);
  }

  return ticketCategories;
};

export const updateConcertService = async (concertId, payload) => {
  const concert = await findConcertByIdForAdminRepository(concertId);

  if (!concert) {
    throw new AppError("Concert not found", 404);
  }

  const data = {};

  if (payload.name !== undefined) {
    if (!payload.name) {
      throw new AppError("name cannot be empty", 400);
    }

    data.name = payload.name;
  }

  if (payload.venue !== undefined) {
    if (!payload.venue) {
      throw new AppError("venue cannot be empty", 400);
    }

    data.venue = payload.venue;
  }

  if (payload.status !== undefined) {
    if (!payload.status) {
      throw new AppError("status cannot be empty", 400);
    }

    data.status = payload.status;
  }

  if (payload.startTime !== undefined) {
    const parsedStartTime = new Date(payload.startTime);

    if (Number.isNaN(parsedStartTime.getTime())) {
      throw new AppError("startTime must be a valid datetime", 400);
    }

    data.startTime = parsedStartTime;
  }

  const updatedConcert = await updateConcertRepository(concertId, data);

  await invalidateConcertCache(concertId);

  return updatedConcert;
};

export const deleteConcertService = async (concertId) => {
  const concert = await findConcertByIdForAdminRepository(concertId);

  if (!concert) {
    throw new AppError("Concert not found", 404);
  }

  if (concert.bookings.length > 0) {
    throw new AppError("Cannot delete concert that already has bookings", 409);
  }

  if (concert.ticketCategories.length > 0) {
    throw new AppError(
      "Cannot delete concert that still has ticket categories",
      409,
    );
  }

  await deleteConcertRepository(concertId);
  await invalidateConcertCache(concertId);
};
