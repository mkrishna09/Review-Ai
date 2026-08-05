import { Router } from "express";
import authController from "./auth.controller";

const router = Router();

router.get("/github", authController.githubLogin);

router.get("/github/callback", authController.githubCallback);

export default router;
