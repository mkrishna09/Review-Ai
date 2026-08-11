import { Router } from "express";
import reviewController from "./review.controller";
import authenticate from "../../middleware/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";
import validate from "../../middleware/validate";
import { createReviewSchema } from "./review.request.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createReviewSchema),
  asyncHandler(reviewController.createReview),
);

router.get("/:reviewId", reviewController.getReview);

export default router;
