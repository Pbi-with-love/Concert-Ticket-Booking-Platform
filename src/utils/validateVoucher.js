export const validateDiscountType = (discountType) => {
  if (!["PERCENTAGE", "FIXED"].includes(discountType)) {
    throw new AppError("discountType must be PERCENTAGE or FIXED", 400);
  }
};

export const validateVoucherNumbers = ({
  discountType,
  discountValue,
  maxUsage,
  usedCount = 0,
}) => {
  if (discountValue === undefined || Number(discountValue) <= 0) {
    throw new AppError("discountValue must be greater than 0", 400);
  }

  if (discountType === "PERCENTAGE" && Number(discountValue) > 100) {
    throw new AppError("percentage discountValue cannot exceed 100", 400);
  }

  if (!Number.isInteger(maxUsage) || maxUsage <= 0) {
    throw new AppError("maxUsage must be a positive integer", 400);
  }

  if (!Number.isInteger(usedCount) || usedCount < 0) {
    throw new AppError("usedCount must be a non-negative integer", 400);
  }

  if (usedCount > maxUsage) {
    throw new AppError("usedCount cannot exceed maxUsage", 400);
  }
};

export const parseVoucherDates = ({ startDate, endDate }) => {
  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);

  if (Number.isNaN(parsedStartDate.getTime())) {
    throw new AppError("startDate must be a valid datetime", 400);
  }

  if (Number.isNaN(parsedEndDate.getTime())) {
    throw new AppError("endDate must be a valid datetime", 400);
  }

  if (parsedStartDate >= parsedEndDate) {
    throw new AppError("startDate must be before endDate", 400);
  }

  return {
    startDate: parsedStartDate,
    endDate: parsedEndDate,
  };
};