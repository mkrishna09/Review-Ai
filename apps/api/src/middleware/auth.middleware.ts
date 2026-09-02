import { Request, Response, NextFunction } from "express";
import jwtService from "../services/jwt.service";
import { AUTH_COOKIE } from "../modules/auth/auth.controller";

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;
  const token = headerToken ?? req.cookies?.[AUTH_COOKIE];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing",
    });
  }

  try {
    const isRevoked = await jwtService.isTokenRevoked(token);
    if (isRevoked) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please log in again.",
      });
    }

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
      message: "Invalid or expired token",
    });
  }
}
