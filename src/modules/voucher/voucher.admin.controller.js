import {
  createVoucherService,
  deleteVoucherService,
  getAllVouchersService,
  getVoucherByIdService,
  updateVoucherService,
  deactivateVoucherService,
  activateVoucherService
} from "./voucher.admin.service.js";

export const createVoucherAdminController = async (req, res, next) => {
  try {
    const voucher = await createVoucherService(req.body);

    res.status(201).json({
      message: "Voucher created successfully",
      data: voucher,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllVouchersAdminController = async (req, res, next) => {
  try {
    const vouchers = await getAllVouchersService();

    res.status(200).json({
      message: "Vouchers fetched successfully",
      data: vouchers,
    });
  } catch (error) {
    next(error);
  }
};

export const getVoucherByIdAdminController = async (req, res, next) => {
  try {
    const voucher = await getVoucherByIdService(req.params.id);

    res.status(200).json({
      message: "Voucher fetched successfully",
      data: voucher,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVoucherAdminController = async (req, res, next) => {
  try {
    const voucher = await updateVoucherService(req.params.id, req.body);

    res.status(200).json({
      message: "Voucher updated successfully",
      data: voucher,
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateVoucherAdminController = async (req, res, next) => {
  try {
    const voucher = await deactivateVoucherService(req.params.id);

    res.status(200).json({
      message: "Voucher deactivated successfully",
      data: voucher,
    });
  } catch (error) {
    next(error);
  }
}

export const activateVoucherAdminController = async (req, res, next) => {
  try {
    const voucher = await activateVoucherService(req.params.id);

    res.status(200).json({
      message: "Voucher activated successfully",
      data: voucher,
    });
  } catch (error) {
    next(error);
  }
}

export const deleteVoucherAdminController = async (req, res, next) => {
  try {
    await deleteVoucherService(req.params.id);

    res.status(200).json({
      message: "Voucher deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
