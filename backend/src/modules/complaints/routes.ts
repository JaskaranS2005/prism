import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  assignComplaint,
} from "./controller.js";

console.log("Complaint routes loaded");

const router = Router();

router.get("/test", (_req, res) => {
  res.json({ ok: true });
});

router.post("/", authenticate, createComplaint);

router.get("/my", authenticate, getMyComplaints);

router.get("/:id", authenticate, getComplaintById);
router.patch("/:id/assign", authenticate, assignComplaint);
export default router;
