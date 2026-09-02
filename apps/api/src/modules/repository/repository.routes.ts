import { Router } from "express";
import repositoryController from "./repository.controller";
import authMiddleware from "../../middleware/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

router.get("/me", authMiddleware, repositoryController.me);
router.post(
  "/sync",
  authMiddleware,
  asyncHandler(repositoryController.syncRepositories),
);
router.get(
  "/",
  authMiddleware,
  asyncHandler(repositoryController.getRepositories),
);
router.get(
  "/:id/reviews",
  authMiddleware,
  asyncHandler(repositoryController.getReviewHistory),
);
router.get(
  "/:id",
  authMiddleware,
  asyncHandler(repositoryController.getRepositoryById),
);

export default router;
