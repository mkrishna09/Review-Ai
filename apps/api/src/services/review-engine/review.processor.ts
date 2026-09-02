import authRepository from "../../modules/auth/auth.repository";
import IssueRepository from "../../modules/issue/issue.repository";
import repositoryRepository from "../../modules/repository/repository.repository";
import reviewRepository from "../../modules/review/review.repository";

import repositoryParser from "./repository-parser";
import tokenBudgetManager from "./token-budget-manager";
import promptBuilder from "./prompt-builder";
import AiService from "../ai.service";
import logger from "../../logger/logger";

import { AI_CONFIG } from "../../config/ai.config";
import { ReviewJobData } from "../../jobs/review-job.types";

class ReviewProcessor {
  async process(job: ReviewJobData): Promise<void> {
    const { reviewId, repositoryId, userId } = job;
    const startedAt = Date.now();

    try {
      logger.info(`ReviewProcessor: starting review ${reviewId}`, {
        reviewId,
        repositoryId,
        userId,
      });

      // Step 1: Mark review as RUNNING
      await reviewRepository.markReviewAsRunning(reviewId);

      // Step 2: Load repository
      const repository = await repositoryRepository.getRepositoryById(
        repositoryId,
        userId,
      );

      if (!repository) {
        throw new Error(`Repository not found: ${repositoryId}`);
      }

      // Step 3: Load GitHub account with decrypted access token
      const githubAccount = await authRepository.getGithubAccount(userId);

      if (!githubAccount) {
        throw new Error(`GitHub account not found for user: ${userId}`);
      }

      // Step 4: Parse repository files from GitHub
      logger.info(
        `ReviewProcessor: parsing repository tree for ${repository.fullName}`,
      );
      const parsedRepository = await repositoryParser.parseRepository(
        githubAccount.accessToken,
        repository.owner,
        repository.name,
        repository.defaultBranch,
      );

      // Step 5: Fit into token budget
      const optimizedRepository =
        tokenBudgetManager.fitRepository(parsedRepository);

      // Step 6: Build prompt
      const prompt = promptBuilder.buildReviewPrompt(optimizedRepository);

      // Step 7: Call AI Service (Gemini / Mock)
      logger.info(
        `ReviewProcessor: sending prompt (${prompt.length} chars) to AI engine`,
      );
      const reviewResult = await AiService.generateReview(prompt);

      // Step 8: Save review completion details
      await reviewRepository.markReviewAsCompleted(reviewId, {
        summary: reviewResult.summary,
        overallScore: reviewResult.overallScore,
        securityScore: reviewResult.securityScore,
        performanceScore: reviewResult.performanceScore,
        maintainabilityScore: reviewResult.maintainabilityScore,
        documentationScore: reviewResult.documentationScore,
        provider: AI_CONFIG.PROVIDER,
        modelUsed: AI_CONFIG.MODEL,
        modelVersion: AI_CONFIG.MODEL,
        promptVersion: AI_CONFIG.PROMPT_VERSION,
        durationMs: Date.now() - startedAt,
      });

      // Step 9: Save issues
      await IssueRepository.createMany(reviewId, reviewResult.issues);

      logger.info(
        `ReviewProcessor: review ${reviewId} completed successfully in ${Date.now() - startedAt}ms`,
        {
          reviewId,
          issuesCount: reviewResult.issues.length,
          overallScore: reviewResult.overallScore,
        },
      );
    } catch (error) {
      logger.error(`ReviewProcessor: review ${reviewId} failed`, {
        reviewId,
        repositoryId,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      await reviewRepository.markReviewAsFailed(reviewId);
      throw error;
    }
  }
}

export default new ReviewProcessor();
