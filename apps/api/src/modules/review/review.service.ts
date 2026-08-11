import reviewQueue from "../../jobs/review.queue";
import repositoryRepository from "../repository/repository.repository";
import reviewRepository from "./review.repository";
import NotFoundError from "../../errors/NotFoundError";
import { AI_CONFIG } from "../../config/ai.config";

class ReviewService {
  async createReview(repositoryId: string, userId: string) {
    const repository = await repositoryRepository.getRepositoryById(
      repositoryId,
      userId,
    );

    if (!repository) {
      throw new NotFoundError("Repository not found");
    }

    const review = await reviewRepository.createReview(
      repositoryId,
      AI_CONFIG.PROMPT_VERSION,
    );

    await reviewQueue.enqueueReview({
      reviewId: review.id,
      repositoryId,
      userId,
    });

    return review;
  }
  async getReview(reviewId: string) {
    const review = await reviewRepository.getReviewById(reviewId);

    if (!review) {
      throw new NotFoundError("Review not found");
    }

    return review;
  }
}

export default new ReviewService();
