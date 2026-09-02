import { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  key?: (req: Request) => string;
};
type Entry = { count: number; resetAt: number };

/** A small, dependency-free limit for a single API process. Use Redis-backed limits when scaling horizontally. */
export default function rateLimit({
  windowMs,
  max,
  key = (req) => req.ip ?? "unknown",
}: RateLimitOptions) {
  const entries = new Map<string, Entry>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const identifier = key(req);
    const current = entries.get(identifier);
    const entry =
      !current || current.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : current;
    entry.count += 1;
    entries.set(identifier, entry);

    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", Math.max(0, max - entry.count));
    res.setHeader("RateLimit-Reset", Math.ceil(entry.resetAt / 1000));
    if (entry.count > max) {
      return res
        .status(429)
        .json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
    }
    next();
  };
}
