import { Router } from "express";
import { RoleType } from "@prisma/client";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { createGovernmentUser } from "./controller.js";

const router = Router();

router.post(
  "/users",
  authenticate,
  authorize(
    RoleType.SUPER_ADMIN,
    RoleType.STATE_ADMIN,
    RoleType.DISTRICT_ADMIN,
    RoleType.MUNICIPAL_ADMIN,
    RoleType.DEPARTMENT_HEAD
  ),
  createGovernmentUser
);

export default router;
