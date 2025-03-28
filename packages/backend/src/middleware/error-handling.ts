import { Request, Response, NextFunction } from 'express';
import { ApiResponse, createResponse } from '@budget-tracker/common';

// Error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction,
) => {
  console.error(err.stack);
  res
    .status(500)
    .json(createResponse(false, 500, null, 'Internal Server Error'));
};
