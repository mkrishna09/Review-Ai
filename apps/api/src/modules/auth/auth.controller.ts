import { Request, Response, NextFunction } from "express";

class AuthController {
  async githubLogin(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        message: "GitHub login endpoint",
      });
    } catch (error) {
      next(error);
    }
  }

  async githubCallback(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        message: "GitHub callback endpoint",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
