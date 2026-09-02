import { Worker } from "bullmq";
import { redis } from "../lib/redis";
import reviewProcessor from "../services/review-engine/review.processor";
import logger from "../logger/logger";

export const reviewWorker = new Worker(
  "review-queue",
  async (job) => {
    logger.info(`BullMQ Worker: processing review job ${job.id}`, {
      jobId: job.id,
      reviewId: job.data.reviewId,
      repositoryId: job.data.repositoryId,
    });

    await reviewProcessor.process(job.data);

    logger.info(`BullMQ Worker: review job ${job.id} completed`, {
      jobId: job.id,
      reviewId: job.data.reviewId,
    });
  },
  {
    connection: redis,
    concurrency: 2,
  },
);

reviewWorker.on("completed", (job) => {
  logger.info(`BullMQ Worker Event: job ${job.id} finished successfully`);
});

reviewWorker.on("failed", (job, error) => {
  logger.error(`BullMQ Worker Event: job ${job?.id} failed`, {
    jobId: job?.id,
    attemptsMade: job?.attemptsMade,
    error: error.message,
    stack: error.stack,
  });
});

reviewWorker.on("error", (error) => {
  logger.error("BullMQ Worker Event: unexpected worker error", {
    error: error.message,
    stack: error.stack,
  });
});

export default reviewWorker;
