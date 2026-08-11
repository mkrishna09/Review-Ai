import { Request, Response, NextFunction } from "express";
import authService from "./auth.service";

class AuthController {
  githubLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const url = authService.getGithubAuthorizationUrl();

      res.redirect(url);
    } catch (error) {
      next(error);
    }
  }

  async githubCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.query.code as string;

      const response = await authService.githubCallback(code);

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
