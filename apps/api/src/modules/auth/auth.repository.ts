import prisma from "../../database/prisma";

class AuthRepository {
  async upsertUser(data: {
    email: string;
    name: string;
    avatarUrl?: string;
    githubId: string;
    username: string;
    accessToken: string;
  }) {
    return prisma.user.upsert({
      where: {
        email: data.email,
      },

      update: {
        name: data.name,
        avatarUrl: data.avatarUrl,

        githubAccount: {
          upsert: {
            create: {
              githubId: data.githubId,
              username: data.username,
              accessToken: data.accessToken,
            },

            update: {
              username: data.username,
              accessToken: data.accessToken,
            },
          },
        },
      },

      create: {
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,

        githubAccount: {
          create: {
            githubId: data.githubId,
            username: data.username,
            accessToken: data.accessToken,
          },
        },
      },

      include: {
        githubAccount: true,
      },
    });
  }
  async getGithubAccount(userId: string) {
    return prisma.gitHubAccount.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        githubId: true,
        username: true,
        accessToken: true,
        refreshToken: true,
        expiresAt: true,
        userId: true,
      },
    });
  }
}

export default new AuthRepository();
