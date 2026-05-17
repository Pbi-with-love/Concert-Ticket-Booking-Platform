import express from "express";
import {
  getAllConcertsController,
  getConcertByIdController,
  getTicketCategoriesByConcertIdController,
} from "./concert.controller.js";

const router = express.Router();

router.get("/", getAllConcertsController);
router.get("/:id/ticket-categories", getTicketCategoriesByConcertIdController);
router.get("/:id", getConcertByIdController);

export default router;
