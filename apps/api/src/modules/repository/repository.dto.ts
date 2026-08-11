export interface RepositoryCardDto {
  id: string;

  name: string;

  fullName: string;

  description: string | null;

  language: string | null;

  visibility: "PUBLIC" | "PRIVATE";

  stars: number;

  forks: number;

  reviewCount: number;

  totalIssues: number;

  status: string;

  lastReviewedAt: Date | null;

  githubUrl: string;
}
