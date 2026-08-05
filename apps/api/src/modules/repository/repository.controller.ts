import { Request, Response } from "express";
import repositoryService from "./repository.service";

class RepositoryController {
  async test(req: Request, res: Response) {
    const users = await repositoryService.testConnection();

    res.json(users);
  }
}

export default new RepositoryController();
