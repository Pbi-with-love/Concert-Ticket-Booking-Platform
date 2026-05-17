export const validateTicketCategoryNumbers = ({
  price,
  totalQuantity,
  availableQuantity,
}) => {
  if (price === undefined || Number(price) < 0) {
    throw new AppError(
      "price must be greater than or equal to 0",
      400,
    );
  }

  if (
    !Number.isInteger(totalQuantity) ||
    totalQuantity < 0
  ) {
    throw new AppError(
      "totalQuantity must be a non-negative integer",
      400,
    );
  }

  if (
    !Number.isInteger(availableQuantity) ||
    availableQuantity < 0
  ) {
    throw new AppError(
      "availableQuantity must be a non-negative integer",
      400,
    );
  }

  if (availableQuantity > totalQuantity) {
    throw new AppError(
      "availableQuantity cannot exceed totalQuantity",
      400,
    );
  }
};