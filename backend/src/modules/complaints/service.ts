import ApiError from "../../utils/ApiError.js";
import { createComplaint, findDepartmentById } from "./repository.js";
import { CreateComplaintInput } from "./types.js";
import { findComplaintsByUserId } from "./repository.js";

export async function getMyComplaintsService(userId: string) {
  return findComplaintsByUserId(userId);
}
export async function createComplaintService(userId: string, data: CreateComplaintInput) {
  const department = await findDepartmentById(data.departmentId);

  if (!department) {
    throw new ApiError(404, "Department not found.");
  }

  const complaint = await createComplaint(userId, data);

  return complaint;
}
