import { Request, Response } from "express";
import { CreateReviewRequest } from "./review.request.validation";
import reviewService from "./review.service";
import ValidationError from "../../errors/ValidationError";

class ReviewController {
  async createReview(req: Request, res: Response) {
    const body: CreateReviewRequest = req.body;
    const { repositoryId } = body;

    const review = await reviewService.createReview(repositoryId, req.user!.id);

    return res.status(202).json({
      success: true,
      message: "Review started",
      data: {
        reviewId: review.id,
        status: review.status,
      },
    });
  }
  async getReview(req: Request, res: Response) {
    const { reviewId } = req.params;
    if (typeof reviewId !== "string") {
      throw new ValidationError("Invalid review ID");
    }

    const review = await reviewService.getReview(reviewId, req.user!.id);

    res.status(200).json({
      success: true,
      data: review,
    });
  }
}

export default new ReviewController();
