import { z } from "zod";

export const createReviewSchema = z.object({
  repositoryId: z.string().cuid("Invalid repository ID"),
});

export type CreateReviewRequest = z.infer<typeof createReviewSchema>;
