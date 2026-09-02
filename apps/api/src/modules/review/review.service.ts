import reviewQueue from "../../jobs/review.queue";
import repositoryRepository from "../repository/repository.repository";
import reviewRepository from "./review.repository";
import NotFoundError from "../../errors/NotFoundError";
import { AI_CONFIG } from "../../config/ai.config";
import ConflictError from "../../errors/ConflictError";

class ReviewService {
  async createReview(repositoryId: string, userId: string) {
    const repository = await repositoryRepository.getRepositoryById(
      repositoryId,
      userId,
    );

    if (!repository) {
      throw new NotFoundError("Repository not found");
    }

    const activeReview = await reviewRepository.getActiveReview(repositoryId);
    if (activeReview) {
      throw new ConflictError(
        "A review for this repository is already in progress",
      );
    }

    const review = await reviewRepository.createReview(
      repositoryId,
      AI_CONFIG.PROMPT_VERSION,
    );

    try {
      await reviewQueue.enqueueReview({
        reviewId: review.id,
        repositoryId,
        userId,
      });
    } catch (error) {
      await reviewRepository.markReviewAsFailed(review.id);
      throw error;
    }

    return review;
  }
  async getReview(reviewId: string, userId: string) {
    const review = await reviewRepository.getReviewById(reviewId, userId);

    if (!review) {
      throw new NotFoundError("Review not found");
    }

    return review;
  }
}

export default new ReviewService();
