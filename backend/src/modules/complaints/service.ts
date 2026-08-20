import ApiError from "../../utils/ApiError.js";

import {
  assignComplaint,
  createComplaint,
  findComplaintById,
  findComplaintsByUserId,
  findDepartmentById,
  findUserById,
  updateComplaintStatus,
} from "./repository.js";

import { AssignComplaintInput, CreateComplaintInput, UpdateComplaintStatusInput } from "./types.js";
import { ComplaintStatus } from "@prisma/client";
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
  const complaint = await findComplaintById(complaintId);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found.");
  }

  if (complaint.createdById !== userId && complaint.assignedOfficerId !== userId) {
    throw new ApiError(403, "You are not authorized to view this complaint.");
  }

  console.log("Authorization successful.");

  return complaint;
}

export async function assignComplaintService(complaintId: string, data: AssignComplaintInput) {
  const complaint = await findComplaintById(complaintId);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found.");
  }

  const officer = await findUserById(data.officerId);

  if (!officer) {
    throw new ApiError(404, "Officer not found.");
  }

  if (officer.role.name !== "OFFICER") {
    throw new ApiError(400, "Selected user is not an officer.");
  }

  return assignComplaint(complaintId, data.officerId);
}

const allowedTransitions: Partial<Record<ComplaintStatus, ComplaintStatus[]>> = {
  PENDING: [ComplaintStatus.UNDER_REVIEW],
  UNDER_REVIEW: [ComplaintStatus.IN_PROGRESS],
  IN_PROGRESS: [ComplaintStatus.RESOLVED],
};
export async function updateComplaintStatusService(
  complaintId: string,
  userId: string,
  data: UpdateComplaintStatusInput
) {
  const complaint = await findComplaintById(complaintId);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found.");
  }

  if (!complaint.assignedOfficerId) {
    throw new ApiError(400, "Complaint has not been assigned to an officer.");
  }

  if (complaint.assignedOfficerId !== userId) {
    throw new ApiError(403, "Only the assigned officer can update the complaint status.");
  }

  const allowedNextStatuses = allowedTransitions[complaint.status];

  if (!allowedNextStatuses?.includes(data.status)) {
    throw new ApiError(400, `Invalid status transition: ${complaint.status} → ${data.status}`);
  }

  return updateComplaintStatus(complaintId, data.status);
}
