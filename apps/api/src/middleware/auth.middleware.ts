import { Request, Response, NextFunction } from "express";
import jwtService from "../services/jwt.service";

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = jwtService.verifyToken(token) as {
      userId: string;
      email: string;
    };

    req.user = {
      id: payload.userId,
      email: payload.email,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}
