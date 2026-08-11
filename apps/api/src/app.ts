import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import requestLogger from "./middleware/requestLogger";
import errorHandler from "./middleware/errorHandler";

import repositoryRoutes from "./modules/repository/repository.routes";
import authRoutes from "./modules/auth/auth.routes";
import reviewRoutes from "./modules/review/review.routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());

app.use(requestLogger);

// Routes
app.get("/api/v1/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "ReviewAI API is running",
  });
});

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/repositories", repositoryRoutes);

app.use("/api/v1/reviews", reviewRoutes);

// 404 (must be after all routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
