import { z } from "zod";

export const reviewParamsSchema = z.object({
  reviewId: z.string().cuid(),
});

export type ReviewParams = z.infer<typeof reviewParamsSchema>;
