export interface GithubTreeItem {
  path: string;
  type: "blob" | "tree";
}

export interface GithubApiRepository {
  id: number;
  owner: { login: string };
  name: string;
  full_name: string;
  description: string | null;
  default_branch: string;
  language: string | null;
  visibility: "public" | "private";
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  archived: boolean;
  private: boolean;
  pushed_at: string | null;
  updated_at: string | null;
}

export interface GitHubRepository {
  githubId: string;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  language: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  githubUrl: string;
  forks: number;
  stars: number;
  openIssues: number;
  size: number;
  isArchived: boolean;
  isPrivate: boolean;
  pushedAt: Date | null;
  updatedOnGithub: Date | null;
  userId: string;
}
