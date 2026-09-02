import app from "./app";
import config from "./config/env";
import logger from "./logger/logger";
import reviewWorker from "./jobs/review.worker";
import reviewQueue from "./jobs/review.queue";
import { redis } from "./lib/redis";
import prisma from "./database/prisma";

const server = app.listen(config.port, () => {
  logger.info(
    `ReviewAI API running in ${config.nodeEnv} mode on port ${config.port}`,
  );
});

let isShuttingDown = false;

async function handleGracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  // Force process exit after 10 seconds if connections refuse to drain
  const forceExitTimeout = setTimeout(() => {
    logger.error("Graceful shutdown timed out after 10s. Forcing exit.");
    process.exit(1);
  }, 10000);
  forceExitTimeout.unref();

  server.close(async () => {
    logger.info("HTTP server closed to new connections.");

    try {
      // 1. Close BullMQ worker (wait for currently active jobs to finish)
      await reviewWorker.close();
      logger.info("BullMQ review worker shut down.");

      // 2. Close BullMQ queue
      await reviewQueue.close();
      logger.info("BullMQ review queue shut down.");

      // 3. Close Redis connection
      await redis.quit();
      logger.info("Redis connection closed.");

      // 4. Disconnect Prisma
      await prisma.$disconnect();
      logger.info("Prisma database client disconnected.");

      clearTimeout(forceExitTimeout);
      logger.info("ReviewAI API graceful shutdown complete. Goodbye!");
      process.exit(0);
    } catch (shutdownError) {
      logger.error("Error during graceful shutdown execution", {
        error: shutdownError,
      });
      process.exit(1);
    }
  });
}

process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
