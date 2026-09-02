import { Request, Response, NextFunction } from "express";
import config from "../config/env";
import { AUTH_COOKIE } from "../modules/auth/auth.controller";

/**
 * CSRF Protection Middleware
 *
 * Security Context:
 * 1. Bearer Token Authentication:
 *    Bearer tokens sent via the `Authorization: Bearer <token>` header are immune
 *    to Cross-Site Request Forgery (CSRF) by design. Browsers NEVER attach custom
 *    request headers automatically to cross-site requests or form submissions.
 *    Any custom header sent by JavaScript triggers a CORS preflight (OPTIONS) request.
 *
 * 2. Cookie Authentication:
 *    Requests authenticated via the HttpOnly `review_ai_token` cookie can potentially
 *    be subject to CSRF attacks if submitted from another origin.
 *
 * Defense Strategy:
 * - Safe HTTP methods (GET, HEAD, OPTIONS) are read-only and bypassed.
 * - If the request is authenticated via Bearer token, it is bypassed (CSRF-immune).
 * - For cookie-authenticated mutating methods (POST, PUT, PATCH, DELETE), we verify:
 *   a) The `Origin` header matches `config.frontendUrl`, OR
 *   b) A custom anti-CSRF header (`X-Requested-With` or `X-CSRF-Protection`) is present.
 */
export default function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Safe HTTP methods do not mutate state
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // If explicit Bearer token is provided in Authorization header, CSRF is impossible
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return next();
  }

  // If no cookie token is present either, let downstream authMiddleware handle 401
  const cookieToken = req.cookies?.[AUTH_COOKIE];
  if (!cookieToken) {
    return next();
  }

  // Request is relying on cookie authentication for a state-mutating action.
  // Validate Origin header if present
  const origin = req.headers.origin;
  if (origin) {
    try {
      const allowedOrigin = new URL(config.frontendUrl).origin;
      const requestOrigin = new URL(origin).origin;

      if (requestOrigin !== allowedOrigin) {
        return res.status(403).json({
          success: false,
          message: "Cross-site request blocked: origin mismatch",
        });
      }
      return next();
    } catch {
      return res.status(403).json({
        success: false,
        message: "Invalid origin header",
      });
    }
  }

  // If Origin is not sent (e.g. some same-origin or HTTP clients), check for custom header
  const customHeader =
    req.headers["x-requested-with"] || req.headers["x-csrf-protection"];
  if (customHeader) {
    return next();
  }

  // Check Referer header as fallback
  const referer = req.headers.referer;
  if (referer) {
    try {
      const allowedOrigin = new URL(config.frontendUrl).origin;
      const refererOrigin = new URL(referer).origin;

      if (refererOrigin === allowedOrigin) {
        return next();
      }
    } catch {
      // ignore parse error
    }
  }

  return res.status(403).json({
    success: false,
    message:
      "CSRF verification failed: missing valid origin or custom request header",
  });
}
