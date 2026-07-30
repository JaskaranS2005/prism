import ApiError from "../../utils/ApiError.js";

import {
  createComplaint,
  findComplaintById,
  findComplaintsByUserId,
  findDepartmentById,
} from "./repository.js";

import { CreateComplaintInput } from "./types.js";

export async function createComplaintService(userId: string, data: CreateComplaintInput) {
  const department = await findDepartmentById(data.departmentId);

  if (!department) {
    throw new ApiError(404, "Department not found.");
  }

  const complaint = await createComplaint(userId, data);

  return complaint;
}

export async function getMyComplaintsService(userId: string) {
  return findComplaintsByUserId(userId);
}

export async function getComplaintByIdService(complaintId: string, userId: string) {
  console.log("========== SERVICE ==========");
  console.log("Complaint ID:", complaintId);
  console.log("User ID:", userId);

  const complaint = await findComplaintById(complaintId);

  console.log("Complaint from DB:");
  console.log(complaint);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found.");
  }

  if (complaint.createdById !== userId && complaint.assignedOfficerId !== userId) {
    throw new ApiError(403, "You are not authorized to view this complaint.");
  }

  console.log("Authorization successful.");

  return complaint;
}
