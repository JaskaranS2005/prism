import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { RoleType } from "@prisma/client";
import { authorize } from "../../middleware/authorize.middleware.js";
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  disputeComplaint,
  reopenComplaint,
  getComplaintStatusHistory,
  closeComplaint,
} from "./controller.js";
console.log("Complaint routes loaded");

const router = Router();

router.get("/test", (_req, res) => {
  res.json({ ok: true });
});

router.post("/", authenticate, createComplaint);

router.get("/my", authenticate, getMyComplaints);

router.get("/:id", authenticate, getComplaintById);
router.patch(
  "/:id/assign",
  authenticate,
  authorize(
    RoleType.SUPER_ADMIN,
    RoleType.STATE_ADMIN,
    RoleType.DISTRICT_ADMIN,
    RoleType.MUNICIPAL_ADMIN,
    RoleType.DEPARTMENT_HEAD
  ),
  assignComplaint
);
router.patch("/:id/status", authenticate, updateComplaintStatus);
router.post("/:id/dispute", authenticate, disputeComplaint);
router.patch("/:id/reopen", authenticate, reopenComplaint);
router.patch("/:complaintId/close", authenticate, closeComplaint);
router.get("/:complaintId/history", authenticate, getComplaintStatusHistory);
export default router;
