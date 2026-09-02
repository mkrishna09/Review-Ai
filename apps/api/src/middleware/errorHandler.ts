import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import logger from "../logger/logger";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  logger.error({
    err: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "An unexpected error occurred" : err.message,
  });
};

export default errorHandler;
