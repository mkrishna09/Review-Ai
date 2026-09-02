import { Router } from "express";
import authController from "./auth.controller";
import asyncHandler from "../../utils/asyncHandler";
import rateLimit from "../../middleware/rateLimit";

const router = Router();

router.get(
  "/github",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  asyncHandler(authController.githubLogin),
);

router.get("/github/callback", asyncHandler(authController.githubCallback));
router.post("/logout", asyncHandler(authController.logout));

export default router;
