import { Prisma } from "@prisma/client";
import prisma from "../../database/prisma";
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
    const where: Prisma.RepositoryWhereInput = {
      userId,

      ...(query.search
        ? {
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
          }
        : {}),

      ...(query.language
        ? {
            language: query.language,
          }
        : {}),

      ...(query.visibility
        ? {
            visibility: query.visibility,
          }
        : {}),
    };

    const orderBy: Prisma.RepositoryOrderByWithRelationInput = {
      [query.sortBy ?? "updatedAt"]: query.order ?? "desc",
    };

    const repositories = await prisma.repository.findMany({
      where,

      include: {
        reviews: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            overallScore: true,
            status: true,
            createdAt: true,
          },
        },

        _count: {
          select: {
            reviews: true,
          },
        },
      },

      orderBy,

      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    const total = await prisma.repository.count({
      where,
    });

    const totalPages = Math.ceil(total / query.limit);

    const formattedRepositories = repositories.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.fullName,
      visibility: repo.visibility,
      defaultBranch: repo.defaultBranch,
      language: repo.language,
      updatedAt: repo.updatedAt,

      reviewCount: repo._count.reviews,

      latestReview: repo.reviews[0] ?? null,
    }));

    return {
      repositories: formattedRepositories,

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
    const repo = await prisma.repository.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        reviews: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            overallScore: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!repo) return null;

    const { reviews, ...rest } = repo;
    return {
      ...rest,
      latestReview: reviews[0] ?? null,
    };
  }

  async getReviewHistory(id: string, userId: string) {
    return prisma.review.findMany({
      where: { repositoryId: id, repository: { userId } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        overallScore: true,
        securityScore: true,
        performanceScore: true,
        maintainabilityScore: true,
        documentationScore: true,
        durationMs: true,
        createdAt: true,
        completedAt: true,
        _count: { select: { issues: true } },
      },
    });
  }
}

export default new RepositoryRepository();
