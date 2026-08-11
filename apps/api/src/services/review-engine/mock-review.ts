import { ReviewResult } from "./review.response.validation";

export const mockReview: ReviewResult = {
  summary:
    "The repository demonstrates a clean architecture with good separation of concerns. Security practices are generally solid, but a few improvements are recommended.",

  overallScore: 88,

  securityScore: 84,

  performanceScore: 91,

  maintainabilityScore: 89,

  documentationScore: 82,

  issues: [
    {
      title: "JWT Secret should not be hardcoded",

      description:
        "Secrets should always be loaded from environment variables.",

      severity: "HIGH",

      category: "SECURITY",

      filePath: "src/config/env.ts",

      line: 12,

      column: 8,

      recommendation: "Move the JWT secret into an environment variable.",

      confidence: 0.98,

      codeSnippet: "const JWT_SECRET = 'my-secret';",
    },

    {
      title: "Missing input validation",

      description: "Incoming request payload is not fully validated.",

      severity: "MEDIUM",

      category: "BEST_PRACTICE",

      filePath: "src/modules/auth/auth.controller.ts",

      line: 35,

      column: 5,

      recommendation: "Validate all request bodies before processing.",

      confidence: 0.91,

      codeSnippet: null,
    },

    {
      title: "Repository parser could process files in parallel",

      description: "Sequential GitHub requests increase review time.",

      severity: "LOW",

      category: "PERFORMANCE",

      filePath: "src/services/review-engine/repository-parser.ts",

      line: 41,

      column: 7,

      recommendation: "Use Promise.all with a concurrency limit.",

      confidence: 0.87,

      codeSnippet: null,
    },
  ],
};
