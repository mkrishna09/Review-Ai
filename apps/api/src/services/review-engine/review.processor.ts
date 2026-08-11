import authRepository from "../../modules/auth/auth.repository";
import IssueRepository from "../../modules/issue/ issue.repository";
import repositoryRepository from "../../modules/repository/repository.repository";
import reviewRepository from "../../modules/review/review.repository";

import repositoryParser from "./repository-parser";
import tokenBudgetManager from "./token-budget-manager";
import promptBuilder from "./prompt-builder";
import AiService from "../ai.service";

import { AI_CONFIG } from "../../config/ai.config";
import { ReviewJobData } from "../../jobs/review-job.types";

class ReviewProcessor {
  async process(job: ReviewJobData): Promise<void> {
    const { reviewId, repositoryId, userId } = job;

    const startedAt = Date.now();

    try {
      console.log("\n====================================");
      console.log("🚀 Starting Review");
      console.log("Review ID:", reviewId);
      console.log("Repository ID:", repositoryId);
      console.log("User ID:", userId);
      console.log("====================================\n");

      console.log("🟡 Step 1: Marking review as RUNNING...");

      await reviewRepository.markReviewAsRunning(reviewId);

      console.log("✅ Review marked as RUNNING");

      console.log("🟡 Step 2: Loading repository...");

      const repository = await repositoryRepository.getRepositoryById(
        repositoryId,
        userId,
      );

      if (!repository) {
        throw new Error("Repository not found");
      }

      console.log("✅ Repository loaded");
      console.log(repository.fullName);

      console.log("🟡 Step 3: Loading GitHub account...");

      const githubAccount = await authRepository.getGithubAccount(userId);

      if (!githubAccount) {
        throw new Error("GitHub account not found");
      }

      console.log("✅ GitHub account loaded");
      console.log(githubAccount.username);

      console.log("🟡 Step 4: Parsing repository...");

      const parsedRepository = await repositoryParser.parseRepository(
        githubAccount.accessToken,
        repository.owner,
        repository.name,
        repository.defaultBranch,
      );

      console.log("✅ Repository parsed");
      console.log(`Files: ${parsedRepository.totalFiles}`);

      console.log("🟡 Step 5: Applying token budget...");

      const optimizedRepository =
        tokenBudgetManager.fitRepository(parsedRepository);

      console.log("✅ Token budget applied");
      console.log(
        `Files after optimization: ${optimizedRepository.files.length}`,
      );

      console.log("🟡 Step 6: Building prompt...");

      const prompt = promptBuilder.buildReviewPrompt(optimizedRepository);

      console.log("✅ Prompt built");
      console.log(`Prompt size: ${prompt.length} characters`);

      console.log("🟡 Step 7: Calling OpenAI...");

      const reviewResult = await AiService.generateReview(prompt);

      console.log("✅ OpenAI completed");

      console.log("🟡 Step 8: Saving review...");

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

      console.log("✅ Review saved");

      console.log("🟡 Step 9: Saving issues...");

      await IssueRepository.createMany(reviewId, reviewResult.issues);

      console.log("✅ Issues saved");

      console.log("\n🎉 Review Completed Successfully!\n");
    } catch (error) {
      console.error("\n====================================");
      console.error("❌ REVIEW PROCESSOR FAILED");
      console.error("====================================");
      console.error(error);
      console.error("====================================\n");

      await reviewRepository.markReviewAsFailed(reviewId);

      throw error;
    }
  }
}

export default new ReviewProcessor();
