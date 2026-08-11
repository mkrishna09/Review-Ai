export interface RepositoryQuery {
  page: number;
  limit: number;
  search?: string;
  language?: string;
  visibility?: "PUBLIC" | "PRIVATE";
  sortBy?: RepositorySortField;
  order?: "asc" | "desc";
}

export type RepositorySortField = "name" | "stars" | "updatedAt" | "createdAt";
