import api from "@/lib/api";

export type ReviewStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
export type IssueSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ReviewIssue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  category: string;
  filePath: string;
  line: number;
  column: number | null;
  recommendation: string;
  confidence: number | null;
  codeSnippet: string | null;
}

export interface Review {
  id: string;
  status: ReviewStatus;
  overallScore: number | null;
  securityScore: number | null;
  performanceScore: number | null;
  maintainabilityScore: number | null;
  documentationScore: number | null;
  summary: string | null;
  createdAt: string;
  completedAt: string | null;
  issues: ReviewIssue[];
  repository: {
    id: string;
    fullName: string;
    githubUrl: string;
    language: string | null;
  };
}

interface ReviewResponse {
  success: boolean;
  data: Review;
}

interface CreateReviewResponse {
  success: boolean;
  data: { reviewId: string; status: ReviewStatus };
}

class ReviewService {
  createReview(repositoryId: string) {
    return api.post<CreateReviewResponse>("/reviews", {
      repositoryId,
    });
  }

  getReview(reviewId: string) {
    return api.get<ReviewResponse>(`/reviews/${reviewId}`);
  }
}

export default new ReviewService();
