import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import config from "./config/env";
import prisma from "./database/prisma";
import { redis } from "./lib/redis";

import requestLogger from "./middleware/requestLogger";
import errorHandler from "./middleware/errorHandler";
import csrfProtection from "./middleware/csrf.middleware";

import repositoryRoutes from "./modules/repository/repository.routes";
import authRoutes from "./modules/auth/auth.routes";
import reviewRoutes from "./modules/review/review.routes";

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-CSRF-Protection",
    ],
    exposedHeaders: [
      "RateLimit-Limit",
      "RateLimit-Remaining",
      "RateLimit-Reset",
    ],
    maxAge: 86400,
  }),
);

app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());

app.use(requestLogger);

// Anti-CSRF protection for cookie-authenticated mutating requests
app.use(csrfProtection);

// Root route
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ReviewAI API is running",
    health: "/api/v1/health",
    apiBase: "/api/v1",
  });
});

// Health check endpoint
app.get("/api/v1/health", async (_req, res) => {
  const [database, cache] = await Promise.allSettled([
    prisma.$queryRaw`SELECT 1`,
    redis.ping(),
  ]);
  const healthy =
    database.status === "fulfilled" && cache.status === "fulfilled";
  res.status(healthy ? 200 : 503).json({
    success: healthy,
    message: healthy ? "ReviewAI API is ready" : "A dependency is unavailable",
    dependencies: {
      database: database.status === "fulfilled" ? "up" : "down",
      redis: cache.status === "fulfilled" ? "up" : "down",
    },
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/repositories", repositoryRoutes);
app.use("/api/v1/reviews", reviewRoutes);

// 404 (must be after all routes)
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
