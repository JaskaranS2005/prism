import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { login, me, register } from "./controller.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { RoleType } from "@prisma/client";
const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, me);

export default router;
