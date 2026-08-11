import { Queue } from "bullmq";
import { redis } from "../lib/redis";
import { ReviewJobData } from "./review-job.types";

class ReviewQueue {
  private queue = new Queue("review-queue", {
    connection: redis,
  });

  async enqueueReview(job: ReviewJobData) {
    await this.queue.add("review", job, {
      attempts: 3,
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }
}

export default new ReviewQueue();
