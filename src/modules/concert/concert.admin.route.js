import express from "express";
import { createConcertAdminController } from "./concert.admin.controller.js";

const router = express.Router();

router.post("/", createConcertAdminController);

export default router;
