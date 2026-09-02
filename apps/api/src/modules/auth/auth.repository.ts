import prisma from "../../database/prisma";
import { encryptToken, decryptToken } from "../../lib/crypto";

class AuthRepository {
  async upsertUser(data: {
    email: string;
    name: string;
    avatarUrl?: string;
    githubId: string;
    username: string;
    accessToken: string;
  }) {
    const encryptedAccessToken = encryptToken(data.accessToken);

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
              accessToken: encryptedAccessToken,
            },

            update: {
              username: data.username,
              accessToken: encryptedAccessToken,
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
            accessToken: encryptedAccessToken,
          },
        },
      },

      include: {
        githubAccount: true,
      },
    });
  }

  async getGithubAccount(userId: string) {
    const account = await prisma.gitHubAccount.findUnique({
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

    if (account && account.accessToken) {
      account.accessToken = decryptToken(account.accessToken);
    }

    return account;
  }
}

export default new AuthRepository();
