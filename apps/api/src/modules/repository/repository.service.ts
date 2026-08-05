import prisma from "../../database/prisma";

class RepositoryService {
  async testConnection() {
    return await prisma.user.findMany();
  }
}

export default new RepositoryService();
