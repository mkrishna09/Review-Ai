import { Worker } from "bullmq";

import { redis } from "../lib/redis";
import reviewProcessor from "../services/review-engine/review.processor";

new Worker(
  "review-queue",
  async (job) => {
    console.log(`📥 Job Received: ${job.id}`);

    await reviewProcessor.process(job.data);

    console.log(`✅ Job Finished: ${job.id}`);
  },
  {
    connection: redis,
    concurrency: 2,
  },
);
