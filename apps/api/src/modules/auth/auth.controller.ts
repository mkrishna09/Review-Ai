import { randomBytes, timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";
import config from "../../config/env";
import UnauthorizedError from "../../errors/UnauthorizedError";
import authService from "./auth.service";
import jwtService from "../../services/jwt.service";

export const AUTH_COOKIE = "review_ai_token";
const OAUTH_STATE_COOKIE = "github_oauth_state";
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: config.nodeEnv === "production",
  path: "/",
};

function isValidState(expected: string | undefined, received: unknown) {
  if (!expected || typeof received !== "string") return false;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

class AuthController {
  githubLogin(_req: Request, res: Response) {
    const state = randomBytes(32).toString("base64url");
    res.cookie(OAUTH_STATE_COOKIE, state, {
      ...cookieOptions,
      maxAge: 10 * 60 * 1000,
    });
    res.redirect(authService.getGithubAuthorizationUrl(state));
  }

  async githubCallback(req: Request, res: Response, next: NextFunction) {
    try {
      if (!isValidState(req.cookies[OAUTH_STATE_COOKIE], req.query.state)) {
        throw new UnauthorizedError("Invalid OAuth state");
      }
      if (typeof req.query.code !== "string") {
        throw new UnauthorizedError("Missing OAuth authorization code");
      }

      res.clearCookie(OAUTH_STATE_COOKIE, cookieOptions);
      const response = await authService.githubCallback(req.query.code);
      res.cookie(AUTH_COOKIE, response.token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.redirect(`${config.frontendUrl}/auth/callback`);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;
    const token = headerToken ?? req.cookies?.[AUTH_COOKIE];

    if (token) {
      await jwtService.revokeToken(token);
    }

    res.clearCookie(AUTH_COOKIE, cookieOptions);
    res.status(204).end();
  }
}

export default new AuthController();
