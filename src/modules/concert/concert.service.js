import AppError from "../../utils/AppError.js";
import { createConcertRepository } from "./concert.repository.js";
import {
  getAllConcertsCache,
  getConcertByIdCache,
  getTicketCategoriesByConcertIdCache
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