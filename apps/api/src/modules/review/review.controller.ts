import { Request, Response } from "express";
import { CreateReviewRequest } from "./review.request.validation";
import reviewService from "./review.service";

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
  async getReview(req, res) {
    const { reviewId } = req.params;

    const review = await reviewService.getReview(reviewId);

    res.status(200).json({
      success: true,
      data: review,
    });
  }
}

export default new ReviewController();
