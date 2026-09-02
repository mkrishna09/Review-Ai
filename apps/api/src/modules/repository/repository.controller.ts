import { Request, Response, NextFunction } from "express";
import repositoryService from "./repository.service";
import { RepositorySortField } from "./repository.types";
import ValidationError from "../../errors/ValidationError";

class RepositoryController {
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
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
      const sortBy = req.query.sortBy;
      const order = req.query.order;
      if (
        sortBy &&
        !["name", "stars", "updatedAt", "createdAt"].includes(String(sortBy))
      ) {
        throw new ValidationError("Invalid repository sort field");
      }
      if (order && order !== "asc" && order !== "desc") {
        throw new ValidationError("Invalid repository sort order");
      }
      const query = {
        page,
        limit,
        search: req.query.search as string | undefined,
        language: req.query.language as string | undefined,
        visibility: req.query.visibility as "PUBLIC" | "PRIVATE" | undefined,
        sortBy: sortBy as RepositorySortField | undefined,
        order: order as "asc" | "desc" | undefined,
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
      if (typeof req.params.id !== "string") {
        throw new ValidationError("Invalid repository ID");
      }
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
  async getReviewHistory(req: Request, res: Response, next: NextFunction) {
    try {
      if (typeof req.params.id !== "string") {
        throw new ValidationError("Invalid repository ID");
      }
      const history = await repositoryService.getReviewHistory(
        req.params.id,
        req.user!.id,
      );
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }
}

export default new RepositoryController();
