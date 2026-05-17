import { createConcertService } from "./concert.service.js";

export const createConcertAdminController = async (req, res, next) => {
  try {
    const concert = await createConcertService(req.body);

    res.status(201).json({
      message: "Concert created successfully",
      data: concert,
    });
  } catch (error) {
    next(error);
  }
};
