import { Router } from "express";
import authController from "./auth.controller";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

router.get("/github", asyncHandler(authController.githubLogin));

router.get("/github/callback", asyncHandler(authController.githubCallback));

export default router;
