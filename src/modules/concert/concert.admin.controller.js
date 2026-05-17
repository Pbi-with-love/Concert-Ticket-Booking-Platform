import {
  createConcertService,
  deleteConcertService,
  updateConcertService,
} from "./concert.service.js";

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

export const updateConcertAdminController = async (req, res, next) => {
  try {
    const concert = await updateConcertService(req.params.id, req.body);

    res.status(200).json({
      message: "Concert updated successfully",
      data: concert,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConcertAdminController = async (req, res, next) => {
  try {
    await deleteConcertService(req.params.id);

    res.status(200).json({
      message: "Concert deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
