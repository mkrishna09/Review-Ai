import authRepository from "../auth/auth.repository";
import githubService from "../../services/github.service";
import repositoryRepository from "./repository.repository";
import { RepositoryQuery } from "./repository.types";
import NotFoundError from "../../errors/NotFoundError";
import { GitHubRepository } from "../../types/github.types";

class RepositoryService {
  async syncRepositories(userId: string) {
    const githubAccount = await authRepository.getGithubAccount(userId);

    if (!githubAccount) {
      throw new Error("GitHub account not connected.");
    }

    const githubRepositories = await githubService.getRepositories(
      githubAccount.accessToken,
    );

    const repositories: GitHubRepository[] = githubRepositories.map((repo) => ({
      githubId: repo.id.toString(),
      owner: repo.owner.login,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      defaultBranch: repo.default_branch,
      language: repo.language,
      visibility: repo.visibility === "private" ? "PRIVATE" : "PUBLIC",
      githubUrl: repo.html_url,

      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      size: repo.size,
      isArchived: repo.archived,
      isPrivate: repo.private,

      pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
      updatedOnGithub: repo.updated_at ? new Date(repo.updated_at) : null,

      userId,
    }));

    await repositoryRepository.upsertRepositories(repositories);

    return {
      success: true,
      message: "Repositories synchronized successfully",
      synced: repositories.length,
    };
  }
  async getRepositories(userId: string, query: RepositoryQuery) {
    return repositoryRepository.getRepositories(userId, query);
  }
  async getRepositoryById(id: string, userId: string) {
    const repository = await repositoryRepository.getRepositoryById(id, userId);

    if (!repository) {
      throw new NotFoundError("Repository not found");
    }

    return repository;
  }
  async getReviewHistory(id: string, userId: string) {
    await this.getRepositoryById(id, userId);
    return repositoryRepository.getReviewHistory(id, userId);
  }
}

export default new RepositoryService();
