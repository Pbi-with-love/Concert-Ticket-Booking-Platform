import {
  getAllConcertsService,
  getConcertByIdService,
  getTicketCategoriesByConcertIdService,
} from "./concert.service.js";

export const getAllConcertsController = async (req, res, next) => {
  try {
    const concerts = await getAllConcertsService();

    res.status(200).json({
      message: "Concerts fetched successfully",
      data: concerts,
    });
  } catch (error) {
    next(error);
  }
};

export const getConcertByIdController = async (req, res, next) => {
  try {
    const concert = await getConcertByIdService(req.params.id);

    res.status(200).json({
      message: "Concert fetched successfully",
      data: concert,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketCategoriesByConcertIdController = async (req, res, next) => {
  try {
    const ticketCategories = await getTicketCategoriesByConcertIdService(
      req.params.id,
    );

    res.status(200).json({
      message: "Ticket categories fetched successfully",
      data: ticketCategories,
    });
  } catch (error) {
    next(error);
  }
};
