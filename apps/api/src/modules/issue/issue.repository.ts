import prisma from "../../database/prisma";
import { ReviewResult } from "../../services/review-engine/review.response.validation";

class IssueRepository {
  async createMany(reviewId: string, issues: ReviewResult["issues"]) {
    return prisma.issue.createMany({
      data: issues.map((issue) => ({
        reviewId,

        title: issue.title,

        description: issue.description,

        severity: issue.severity,

        category: issue.category,

        filePath: issue.filePath,

        line: issue.line,

        column: issue.column,

        recommendation: issue.recommendation,

        confidence: issue.confidence,

        codeSnippet: issue.codeSnippet,
      })),
    });
  }
}

export default new IssueRepository();
