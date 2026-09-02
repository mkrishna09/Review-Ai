import crypto from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/env";
import { redis } from "../lib/redis";
import logger from "../logger/logger";

class JwtService {
  /**
   * Generates a signed JWT with a unique JWT ID (jti)
   */
  generateToken(
    payload: { userId: string; email: string },
    expiresIn: string | number = "7d",
  ): string {
    const jti = crypto.randomBytes(16).toString("hex");

    return jwt.sign(
      {
        ...payload,
        jti,
      },
      config.jwtSecret,
      {
        expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
      },
    );
  }

  /**
   * Verifies the signature and expiration of a JWT
   */
  verifyToken(token: string): JwtPayload | string {
    return jwt.verify(token, config.jwtSecret);
  }

  /**
   * Generates a deterministic cache key for the token
   */
  private getTokenRevocationKey(token: string): string {
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    return `token:revoked:${hash}`;
  }

  /**
   * Revokes a JWT until its natural expiration time
   */
  async revokeToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as JwtPayload | null;
      const now = Math.floor(Date.now() / 1000);

      // Default to 7 days if exp is missing, otherwise calculate remaining seconds
      const ttl =
        decoded?.exp && decoded.exp > now
          ? decoded.exp - now
          : 7 * 24 * 60 * 60;

      const key = this.getTokenRevocationKey(token);
      await redis.set(key, "1", "EX", ttl);
      logger.info("JWT token successfully revoked and blacklisted in Redis");
    } catch (error) {
      logger.error("Failed to revoke JWT in Redis", { error });
    }
  }

  /**
   * Checks if a token has been explicitly revoked
   */
  async isTokenRevoked(token: string): Promise<boolean> {
    try {
      const key = this.getTokenRevocationKey(token);
      const isRevoked = await redis.get(key);
      return isRevoked === "1";
    } catch (error) {
      logger.error("Failed to check token revocation status in Redis", {
        error,
      });
      // In case of Redis outage, fail open to avoid rejecting all valid users,
      // but signature and expiry checks still apply
      return false;
    }
  }
}

export default new JwtService();
