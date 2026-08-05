import { Router } from "express";
import repositoryController from "./repository.controller";

const router = Router();

router.get("/test", repositoryController.test);

export default router;
