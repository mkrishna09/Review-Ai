import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message,
  });
};

export default errorHandler;
