import AppError from "../../utils/AppError.js";
import {
  createTicketCategoryRepository,
  deleteTicketCategoryRepository,
  findAllTicketCategoriesRepository,
  findConcertByIdForTicketCategoryRepository,
  findTicketCategoryByIdRepository,
  updateTicketCategoryRepository,
} from "./ticketCategory.repository.js";
import { validateTicketCategoryNumbers } from "../../utils/validateTicketCategoryNumbers.js";

export const createTicketCategoryService = async (payload) => {
  const {
    concertId,
    name,
    price,
    totalQuantity,
    availableQuantity,
  } = payload;

  if (!concertId || !name) {
    throw new AppError("concertId and name are required", 400);
  }

  if (price === undefined || Number(price) < 0) {
    throw new AppError("price must be greater than or equal to 0", 400);
  }

  if (!Number.isInteger(totalQuantity) || totalQuantity < 0) {
    throw new AppError("totalQuantity must be a non-negative integer", 400);
  }

  if (!Number.isInteger(availableQuantity) || availableQuantity < 0) {
    throw new AppError("availableQuantity must be a non-negative integer", 400);
  }

  if (availableQuantity > totalQuantity) {
    throw new AppError("availableQuantity cannot exceed totalQuantity", 400);
  }

  const concert = await findConcertByIdForTicketCategoryRepository(concertId);

  if (!concert) {
    throw new AppError("Concert not found", 404);
  }

  return createTicketCategoryRepository({
    concertId,
    name,
    price: Number(price),
    totalQuantity,
    availableQuantity,
  });
};

export const getAllTicketCategoriesService = async (concertId) => {
  if (concertId) {
    const concert = await findConcertByIdForTicketCategoryRepository(concertId);

    if (!concert) {
      throw new AppError("Concert not found", 404);
    }
  }

  return findAllTicketCategoriesRepository(concertId);
};

export const getTicketCategoryByIdService = async (ticketCategoryId) => {
  const ticketCategory = await findTicketCategoryByIdRepository(ticketCategoryId);

  if (!ticketCategory) {
    throw new AppError("Ticket category not found", 404);
  }

  return ticketCategory;
};

export const updateTicketCategoryService = async (
  ticketCategoryId,
  payload,
) => {
  const existingTicketCategory =
    await findTicketCategoryByIdRepository(ticketCategoryId);

  if (!existingTicketCategory) {
    throw new AppError("Ticket category not found", 404);
  }

  const mergedData = {
    concertId: payload.concertId ?? existingTicketCategory.concertId,
    name: payload.name ?? existingTicketCategory.name,
    price:
      payload.price !== undefined
        ? Number(payload.price)
        : Number(existingTicketCategory.price),
    totalQuantity:
      payload.totalQuantity ?? existingTicketCategory.totalQuantity,
    availableQuantity:
      payload.availableQuantity ?? existingTicketCategory.availableQuantity,
  };

  if (!mergedData.name) {
    throw new AppError("name is required", 400);
  }

  validateTicketCategoryNumbers(mergedData);

  if (mergedData.concertId !== existingTicketCategory.concertId) {
    const concert = await findConcertByIdForTicketCategoryRepository(
      mergedData.concertId,
    );

    if (!concert) {
      throw new AppError("Concert not found", 404);
    }
  }

  return updateTicketCategoryRepository(ticketCategoryId, mergedData);
};

export const deleteTicketCategoryService = async (ticketCategoryId) => {
  const ticketCategory = await findTicketCategoryByIdRepository(ticketCategoryId);

  if (!ticketCategory) {
    throw new AppError("Ticket category not found", 404);
  }

  if (ticketCategory.bookingItems.length > 0 || ticketCategory.attendees.length > 0) {
    throw new AppError(
      "Cannot delete ticket category that is already used by bookings or attendees",
      409,
    );
  }

  await deleteTicketCategoryRepository(ticketCategoryId);
};
