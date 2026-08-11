export interface GithubTreeItem {
  path: string;
  type: "blob" | "tree";
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
