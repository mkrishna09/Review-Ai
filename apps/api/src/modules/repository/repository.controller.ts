import { Request, Response, NextFunction } from "express";
import repositoryService from "./repository.service";
import { RepositorySortField } from "./repository.types";

class RepositoryController {
  async test(req: Request, res: Response) {
    const users = await repositoryService.testConnection();

    res.json(users);
  }
  async me(req: Request, res: Response) {
    res.json({
      success: true,
      user: req.user,
    });
  }
  async syncRepositories(req: Request, res: Response, next: NextFunction) {
    try {
      const repos = await repositoryService.syncRepositories(req.user!.id);

      res.json(repos);
    } catch (error) {
      next(error);
    }
  }
  async getRepositories(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        search: req.query.search as string | undefined,
        language: req.query.language as string | undefined,
        visibility: req.query.visibility as "PUBLIC" | "PRIVATE" | undefined,
        sortBy: req.query.sortBy as RepositorySortField | undefined,
        order: req.query.order as "asc" | "desc" | undefined,
      };

      const result = await repositoryService.getRepositories(
        req.user!.id,
        query,
      );

      res.json({
        success: true,
        data: result.repositories,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
  async getRepositoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = await repositoryService.getRepositoryById(
        req.params.id,
        req.user!.id,
      );

      res.json({
        success: true,
        data: repository,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RepositoryController();
