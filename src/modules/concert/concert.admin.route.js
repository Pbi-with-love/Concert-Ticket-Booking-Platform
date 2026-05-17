import express from "express";
import {
  createConcertAdminController,
  deleteConcertAdminController,
  updateConcertAdminController,
} from "./concert.admin.controller.js";

const router = express.Router();

router.post("/", createConcertAdminController);
router.patch("/:id", updateConcertAdminController);
router.delete("/:id", deleteConcertAdminController);

export default router;
