import {
  createTicketCategoryService,
  deleteTicketCategoryService,
  getAllTicketCategoriesService,
  getTicketCategoryByIdService,
  updateTicketCategoryService,
} from "./ticketCategory.service.js";

export const createTicketCategoryAdminController = async (req, res, next) => {
  try {
    const ticketCategory = await createTicketCategoryService(req.body);

    res.status(201).json({
      message: "Ticket category created successfully",
      data: ticketCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTicketCategoriesAdminController = async (
  req,
  res,
  next,
) => {
  try {
    const ticketCategories = await getAllTicketCategoriesService(
      req.query.concertId,
    );

    res.status(200).json({
      message: "Ticket categories fetched successfully",
      data: ticketCategories,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketCategoryByIdAdminController = async (
  req,
  res,
  next,
) => {
  try {
    const ticketCategory = await getTicketCategoryByIdService(req.params.id);

    res.status(200).json({
      message: "Ticket category fetched successfully",
      data: ticketCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketCategoryAdminController = async (req, res, next) => {
  try {
    const ticketCategory = await updateTicketCategoryService(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      message: "Ticket category updated successfully",
      data: ticketCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTicketCategoryAdminController = async (req, res, next) => {
  try {
    await deleteTicketCategoryService(req.params.id);

    res.status(200).json({
      message: "Ticket category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
