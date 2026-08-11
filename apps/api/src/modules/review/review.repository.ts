import prisma from "../../database/prisma";
import { ReviewStatus } from "@prisma/client";

class ReviewRepository {
  async createReview(repositoryId: string, promptVersion: string) {
    return prisma.review.create({
      data: {
        repositoryId,
        promptVersion,
        status: ReviewStatus.QUEUED,
      },
    });
  }

  async getReviewById(reviewId: string) {
    return prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      include: {
        issues: {
          orderBy: {
            severity: "desc",
          },
        },
        repository: {
          select: {
            id: true,
            fullName: true,
            githubUrl: true,
            language: true,
          },
        },
      },
    });
  }

  async markReviewAsRunning(reviewId: string) {
    return prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        status: ReviewStatus.RUNNING,
      },
    });
  }

  async markReviewAsCompleted(
    reviewId: string,
    data: {
      summary: string;
      overallScore: number;
      securityScore: number;
      performanceScore: number;
      maintainabilityScore: number;
      documentationScore: number;
      provider: string;
      modelUsed: string;
      modelVersion: string;
      promptVersion: string;
      durationMs: number;
    },
  ) {
    return prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        ...data,
        status: ReviewStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  async markReviewAsFailed(reviewId: string) {
    return prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        status: ReviewStatus.FAILED,
      },
    });
  }
}

export default new ReviewRepository();
