import express from "express";
import {
  createVoucherAdminController,
  deleteVoucherAdminController,
  getAllVouchersAdminController,
  getVoucherByIdAdminController,
  updateVoucherAdminController,
  deactivateVoucherAdminController,
  activateVoucherAdminController
} from "./voucher.admin.controller.js";

const router = express.Router();

router.post("/", createVoucherAdminController);
router.get("/", getAllVouchersAdminController);
router.get("/:id", getVoucherByIdAdminController);
router.patch("/deactivate/:id", deactivateVoucherAdminController);
router.patch("/activate/:id", activateVoucherAdminController);
router.patch("/:id", updateVoucherAdminController);
router.delete("/:id", deleteVoucherAdminController);

export default router;
