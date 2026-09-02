import api from "@/lib/api";

export interface LatestReview {
  id: string;
  overallScore: number | null;
  status: string;
  createdAt: string;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  visibility: "PUBLIC" | "PRIVATE";
  defaultBranch: string;
  language: string | null;
  updatedAt: string;
  reviewCount: number;
  latestReview: LatestReview | null;
}

export interface RepositoryDetail extends Repository {
  description?: string | null;
  githubUrl?: string;
  stars?: number;
  forks?: number;
}

export interface ReviewHistoryItem {
  id: string;
  status: string;
  overallScore: number | null;
  durationMs: number | null;
  createdAt: string;
  completedAt: string | null;
  _count: { issues: number };
}

export interface RepositoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RepositoryResponse {
  success: boolean;
  data: Repository[];
  pagination: RepositoryPagination;
}

interface RepositoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  language?: string;
  visibility?: "PUBLIC" | "PRIVATE";
  sortBy?: string;
  order?: "asc" | "desc";
}

class RepositoryService {
  async getRepositories(query?: RepositoryQuery) {
    const params = new URLSearchParams();

    if (query?.page !== undefined) {
      params.set("page", String(query.page));
    }

    if (query?.limit !== undefined) {
      params.set("limit", String(query.limit));
    }

    if (query?.search) {
      params.set("search", query.search);
    }

    if (query?.language) {
      params.set("language", query.language);
    }

    if (query?.visibility) {
      params.set("visibility", query.visibility);
    }

    if (query?.sortBy) {
      params.set("sortBy", query.sortBy);
    }

    if (query?.order) {
      params.set("order", query.order);
    }

    const queryString = params.toString();

    const url = queryString ? `/repositories?${queryString}` : "/repositories";

    return api.get<RepositoryResponse>(url);
  }

  async getRepository(id: string) {
    return api.get<{ success: boolean; data: RepositoryDetail }>(
      `/repositories/${id}`,
    );
  }

  async syncRepositories() {
    return api.post("/repositories/sync");
  }

  async getReviewHistory(id: string) {
    return api.get<{ success: boolean; data: ReviewHistoryItem[] }>(
      `/repositories/${id}/reviews`,
    );
  }
}

export default new RepositoryService();
