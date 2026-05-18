import prisma from "../../config/prisma.js";

export const createVoucherRepository = async (data) => {
  return prisma.voucher.create({
    data,
  });
};

export const findAllVouchersRepository = async () => {
  return prisma.voucher.findMany({
    orderBy: [
      {
        startDate: "desc",
      },
      {
        code: "asc",
      },
    ],
  });
};

export const findVoucherByIdRepository = async (voucherId) => {
  return prisma.voucher.findUnique({
    where: {
      id: voucherId,
    },
    include: {
      bookings: true,
    },
  });
};

export const findVoucherByCodeRepository = async (code) => {
  return prisma.voucher.findUnique({
    where: {
      code,
    },
  });
};

export const updateVoucherRepository = async (voucherId, data) => {
  return prisma.voucher.update({
    where: {
      id: voucherId,
    },
    data,
  });
};

export const deleteVoucherRepository = async (voucherId) => {
  return prisma.voucher.delete({
    where: {
      id: voucherId,
    },
  });
};
