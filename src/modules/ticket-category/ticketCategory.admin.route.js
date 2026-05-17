import express from "express";
import {
  createTicketCategoryAdminController,
  deleteTicketCategoryAdminController,
  getAllTicketCategoriesAdminController,
  getTicketCategoryByIdAdminController,
  updateTicketCategoryAdminController,
} from "./ticketCategory.admin.controller.js";

const router = express.Router();

router.post("/", createTicketCategoryAdminController);
router.get("/", getAllTicketCategoriesAdminController);
router.get("/:id", getTicketCategoryByIdAdminController);
router.patch("/:id", updateTicketCategoryAdminController);
router.delete("/:id", deleteTicketCategoryAdminController);

export default router;
