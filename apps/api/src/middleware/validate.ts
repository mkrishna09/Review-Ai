import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import ValidationError from "../errors/ValidationError";

const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues[0]?.message ?? "Validation failed",
      );
    }
    next();
  };

export default validate;
