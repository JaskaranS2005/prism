import { Router } from "express";

import { authRouter } from "../modules/auth/index.js";
import healthRouter from "./health.routes.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);

export default router;
