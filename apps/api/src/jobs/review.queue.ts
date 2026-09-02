import { Queue } from "bullmq";
import { redis } from "../lib/redis";
import { ReviewJobData } from "./review-job.types";
import logger from "../logger/logger";

class ReviewQueue {
  private queue = new Queue("review-queue", {
    connection: redis,
  });

  constructor() {
    this.queue.on("error", (error) => {
      logger.error("ReviewQueue connection error", { error });
    });
  }

  async enqueueReview(job: ReviewJobData) {
    await this.queue.add("review", job, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000, // 2s, 4s, 8s backoff
      },
      removeOnComplete: {
        count: 100,
        age: 24 * 3600, // keep for 24 hours
      },
      // Retain failed jobs for dead-letter analysis and debugging
      removeOnFail: false,
    });
    logger.info(
      `Enqueued review job for repositoryId: ${job.repositoryId}, reviewId: ${job.reviewId}`,
    );
  }

  async close() {
    await this.queue.close();
    logger.info("ReviewQueue closed cleanly");
  }
}

export default new ReviewQueue();
