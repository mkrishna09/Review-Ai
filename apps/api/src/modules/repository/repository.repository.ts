import prisma from "../../database/prisma";
import authRepository from "../auth/auth.repository";
import githubService from "../../services/github.service";
import { RepositoryQuery } from "./repository.types";
import { GitHubRepository } from "../../types/github.types";

class RepositoryRepository {
  async upsertRepositories(repositories: GitHubRepository[]) {
    return prisma.$transaction(
      repositories.map((repo) =>
        prisma.repository.upsert({
          where: {
            githubId: repo.githubId,
          },

          update: repo,

          create: repo,
        }),
      ),
    );
  }

  async getRepositories(userId: string, query: RepositoryQuery) {
    const where = {
      userId,

      ...(query.search && {
        OR: [
          {
            name: {
              contains: query.search,
              mode: "insensitive",
            },
          },
          {
            fullName: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        ],
      }),

      ...(query.language && {
        language: query.language,
      }),

      ...(query.visibility && {
        visibility: query.visibility,
      }),
    };
    const [repositories, total] = await prisma.$transaction([
      prisma.repository.findMany({
        where,
        orderBy: {
          [query.sortBy ?? "updatedAt"]: query.order ?? "desc",
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),

      prisma.repository.count({
        where,
      }),
    ]);

    return {
      repositories,
      total,
    };
  }
  async syncRepositories(userId: string) {
    const githubAccount = await authRepository.getGithubAccount(userId);

    if (!githubAccount) {
      throw new Error("GitHub account not connected");
    }

    const githubRepos = await githubService.getRepositories(
      githubAccount.accessToken,
    );

    return githubRepos;
  }
  async getRepositoryById(id: string, userId: string) {
    return prisma.repository.findFirst({
      where: {
        id,
        userId,
      },
    });
  }
}

export default new RepositoryRepository();
