import { Router } from "express";
import reviewController from "./review.controller";
import authenticate from "../../middleware/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";
import validate from "../../middleware/validate";
import { createReviewSchema } from "./review.request.validation";
import rateLimit from "../../middleware/rateLimit";

const router = Router();

router.post(
  "/",
  authenticate,
  rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    key: (req) => req.user?.id ?? req.ip ?? "unknown",
  }),
  validate(createReviewSchema),
  asyncHandler(reviewController.createReview),
);

router.get(
  "/:reviewId",
  authenticate,
  asyncHandler(reviewController.getReview),
);

export default router;
