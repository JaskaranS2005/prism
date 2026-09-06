import { Router } from "express";
import { administrationRoutes } from "../modules/administration/index.js";
import { authRouter } from "../modules/auth/index.js";
import healthRouter from "./health.routes.js";
import { complaintRoutes } from "../modules/complaints/index.js";

const router = Router();
console.log("Main routes loaded");

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/complaints", complaintRoutes);
router.use("/administration", administrationRoutes);
export default router;
