import AppError from "../../utils/AppError.js";
import {
  createVoucherRepository,
  deleteVoucherRepository,
  findAllVouchersRepository,
  findVoucherByCodeRepository,
  findVoucherByIdRepository,
  updateVoucherRepository,
} from "./voucher.admin.repository.js";
import { validateDiscountType, validateVoucherNumbers, parseVoucherDates } from "../../utils/validateVoucher.js";


export const createVoucherService = async (payload) => {
  const {
    code,
    discountType,
    discountValue,
    maxUsage,
    usedCount = 0,
    startDate,
    endDate,
    isActive = true,
  } = payload;

  if (!code || !discountType || !startDate || !endDate) {
    throw new AppError("code, discountType, startDate and endDate are required", 400);
  }

  validateDiscountType(discountType);
  validateVoucherNumbers({
    discountType,
    discountValue,
    maxUsage,
    usedCount,
  });

  const existingVoucher = await findVoucherByCodeRepository(code);

  if (existingVoucher) {
    throw new AppError("Voucher code already exists", 409);
  }

  const dates = parseVoucherDates({ startDate, endDate });

  return createVoucherRepository({
    code,
    discountType,
    discountValue: Number(discountValue),
    maxUsage,
    usedCount,
    startDate: dates.startDate,
    endDate: dates.endDate,
    isActive,
  });
};

export const getAllVouchersService = async () => {
  return findAllVouchersRepository();
};

export const getVoucherByIdService = async (voucherId) => {
  const voucher = await findVoucherByIdRepository(voucherId);

  if (!voucher) {
    throw new AppError("Voucher not found", 404);
  }

  return voucher;
};

export const updateVoucherService = async (voucherId, payload) => {
  const existingVoucher = await findVoucherByIdRepository(voucherId);

  if (!existingVoucher) {
    throw new AppError("Voucher not found", 404);
  }

  const data = {
    code: payload.code ?? existingVoucher.code,
    discountType: payload.discountType ?? existingVoucher.discountType,
    discountValue: payload.discountValue !== undefined ? Number(payload.discountValue) : Number(existingVoucher.discountValue),
    maxUsage: payload.maxUsage ?? existingVoucher.maxUsage,
    usedCount: payload.usedCount ?? existingVoucher.usedCount,
    startDate: payload.startDate ?? existingVoucher.startDate,
    endDate: payload.endDate ?? existingVoucher.endDate,
    isActive: payload.isActive ?? existingVoucher.isActive,
  };

  validateDiscountType(data.discountType);
  validateVoucherNumbers({
    discountType: data.discountType,
    discountValue: data.discountValue,
    maxUsage: data.maxUsage,
    usedCount: data.usedCount,
  });

  if (data.code !== existingVoucher.code) {
    const duplicatedVoucher = await findVoucherByCodeRepository(data.code);

    if (duplicatedVoucher) {
      throw new AppError("Voucher code already exists", 409);
    }
  }

  const dates = parseVoucherDates({
    startDate: data.startDate,
    endDate: data.endDate,
  });

  data.startDate = dates.startDate;
  data.endDate = dates.endDate;

  return updateVoucherRepository(voucherId, data);
};

export const deactivateVoucherService = async (voucherId) => {
  const voucher = await findVoucherByIdRepository(voucherId);

  if (!voucher) {
    throw new AppError("Voucher not found", 404);
  }

  if (!voucher.isActive) {
    throw new AppError("Voucher is already inactive", 400);
  }

  return updateVoucherRepository(voucherId, { isActive: false });
}

export const activateVoucherService = async (voucherId) => {
  const voucher = await findVoucherByIdRepository(voucherId);

  if (!voucher) {
    throw new AppError("Voucher not found", 404);
  }

  if (voucher.isActive) {
    throw new AppError("Voucher is already active", 400);
  }

  const now = new Date();

  if (voucher.endDate <= now) {
    throw new AppError("Cannot activate expired voucher", 400);
  }

  if (voucher.usedCount >= voucher.maxUsage) {
    throw new AppError("Cannot activate voucher that reached max usage", 400);
  }

  return updateVoucherRepository(voucherId, { isActive: true });
}

export const deleteVoucherService = async (voucherId) => {
  const voucher = await findVoucherByIdRepository(voucherId);

  if (!voucher) {
    throw new AppError("Voucher not found", 404);
  }

  if (voucher.isActive) {
    throw new AppError("Deactivate voucher before deleting it", 409);
  }

  if (voucher.bookings.length > 0) {
    throw new AppError("Cannot delete voucher that is already used by bookings", 409);
  }

  return deleteVoucherRepository(voucherId);
};