import { z } from "zod";

export const reviewIssueSchema = z.object({
  title: z.string().min(1),

  description: z.string().min(1),

  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),

  category: z.enum([
    "SECURITY",
    "BUG",
    "PERFORMANCE",
    "STYLE",
    "BEST_PRACTICE",
    "DOCUMENTATION",
  ]),

  filePath: z.string().min(1),

  line: z.number().int().nonnegative(),

  column: z.number().int().nonnegative().nullable(),

  recommendation: z.string().min(1),

  confidence: z.number().min(0).max(1).nullable(),

  codeSnippet: z.string().nullable(),
});

export const reviewResultSchema = z.object({
  summary: z.string().min(1),

  overallScore: z.number().min(0).max(100),

  securityScore: z.number().min(0).max(100),

  performanceScore: z.number().min(0).max(100),

  maintainabilityScore: z.number().min(0).max(100),

  documentationScore: z.number().min(0).max(100),

  issues: z.array(reviewIssueSchema),
});

export type ReviewResult = z.infer<typeof reviewResultSchema>;
