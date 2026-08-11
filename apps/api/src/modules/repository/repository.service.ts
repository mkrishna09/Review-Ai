import prisma from "../../database/prisma";
import authRepository from "../auth/auth.repository";
import githubService from "../../services/github.service";
import repositoryRepository from "./repository.repository";
import { RepositoryQuery } from "./repository.types";
import NotFoundError from "../../errors/NotFoundError";

class RepositoryService {
  async testConnection() {
    return await prisma.user.findMany();
  }

  async syncRepositories(userId: string) {
    const githubAccount = await authRepository.getGithubAccount(userId);

    if (!githubAccount) {
      throw new Error("GitHub account not connected.");
    }

    const githubRepositories = await githubService.getRepositories(
      githubAccount.accessToken,
    );

    const repositories = githubRepositories.map((repo) => ({
      githubId: repo.id.toString(),
      owner: repo.owner.login,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      defaultBranch: repo.default_branch,
      language: repo.language,
      visibility: repo.visibility.toUpperCase(),
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
    const { repositories, total } = await repositoryRepository.getRepositories(
      userId,
      query,
    );

    const totalPages = Math.ceil(total / query.limit);

    return {
      repositories,

      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    };
  }
  async getRepositoryById(id: string, userId: string) {
    const repository = await repositoryRepository.getRepositoryById(id, userId);

    if (!repository) {
      throw new NotFoundError("Repository not found");
    }

    return repository;
  }
}

export default new RepositoryService();
