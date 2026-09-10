import ApiError from "../../utils/ApiError.js";
import { hasScopeAccess } from "../administration/scope.js";
import {
  assignComplaint,
  createComplaint,
  disputeComplaint,
  reopenComplaint,
  findComplaintById,
  findComplaintsByUserId,
  findDepartmentById,
  findUserById,
  closeComplaint,
  updateComplaintStatus,
  getComplaintStatusHistory,
} from "./repository.js";
import {
  AssignComplaintInput,
  CreateComplaintInput,
  DisputeComplaintInput,
  UpdateComplaintStatusInput,
  ReopenComplaintInput,
} from "./types.js";
import { ComplaintStatus, RoleType } from "@prisma/client";

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
export async function assignComplaintService(
  complaintId: string,
  userId: string,
  data: AssignComplaintInput
) {
  const complaint = await findComplaintById(complaintId);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found.");
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const allowedRoles: RoleType[] = [
    RoleType.SUPER_ADMIN,
    RoleType.STATE_ADMIN,
    RoleType.DISTRICT_ADMIN,
    RoleType.MUNICIPAL_ADMIN,
    RoleType.DEPARTMENT_HEAD,
  ];

  if (!allowedRoles.includes(user.role.name)) {
    throw new ApiError(403, "Only authorized administrators can assign complaints.");
  }

  const officer = await findUserById(data.officerId);

  if (!officer) {
    throw new ApiError(404, "Officer not found.");
  }

  if (officer.role.name !== RoleType.OFFICER) {
    throw new ApiError(400, "Selected user is not an officer.");
  }

  const complaintScope = {
    stateId: complaint.department.municipality?.district.state.id,
    districtId: complaint.department.municipality?.districtId,
    municipalityId: complaint.department.municipalityId ?? undefined,
    departmentId: complaint.departmentId,
  };

  const userScope = user.administrativeAssignment
    ? {
        stateId: user.administrativeAssignment.stateId ?? undefined,
        districtId: user.administrativeAssignment.districtId ?? undefined,
        municipalityId: user.administrativeAssignment.municipalityId ?? undefined,
        departmentId: user.administrativeAssignment.departmentId ?? undefined,
      }
    : undefined;

  if (!hasScopeAccess(user.role.name, userScope, complaintScope)) {
    throw new ApiError(
      403,
      "You are not authorized to assign complaints outside your administrative scope."
    );
  }

  const officerScope = officer.administrativeAssignment
    ? {
        stateId: officer.administrativeAssignment.stateId ?? undefined,
        districtId: officer.administrativeAssignment.districtId ?? undefined,
        municipalityId: officer.administrativeAssignment.municipalityId ?? undefined,
        departmentId: officer.administrativeAssignment.departmentId ?? undefined,
      }
    : undefined;

  if (!officerScope) {
    throw new ApiError(400, "Officer does not have an administrative assignment.");
  }

  if (!hasScopeAccess(user.role.name, userScope, officerScope)) {
    throw new ApiError(
      403,
      "You cannot assign a complaint to an officer outside your administrative scope."
    );
  }

  return assignComplaint(complaintId, data.officerId);
}

const allowedTransitions: Partial<Record<ComplaintStatus, ComplaintStatus[]>> = {
  PENDING: [ComplaintStatus.UNDER_REVIEW],
  REOPENED: [ComplaintStatus.UNDER_REVIEW],
  UNDER_REVIEW: [ComplaintStatus.IN_PROGRESS],
  IN_PROGRESS: [ComplaintStatus.RESOLVED],
  RESOLVED: [ComplaintStatus.CLOSED],
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

  return updateComplaintStatus(complaintId, data.status, userId, data.resolutionNote);
}
export async function disputeComplaintService(
  complaintId: string,
  userId: string,
  data: DisputeComplaintInput
) {
  const complaint = await findComplaintById(complaintId);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found.");
  }

  if (complaint.createdById !== userId) {
    throw new ApiError(403, "Only the citizen who created the complaint can dispute it.");
  }

  if (complaint.status !== ComplaintStatus.RESOLVED) {
    throw new ApiError(400, "Only a resolved complaint can be disputed.");
  }

  return disputeComplaint(complaintId, userId, data.reason);
}
export async function reopenComplaintService(
  complaintId: string,
  userId: string,
  data: ReopenComplaintInput
) {
  const complaint = await findComplaintById(complaintId);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found.");
  }

  if (!complaint.assignedOfficerId) {
    throw new ApiError(400, "Complaint has no assigned officer.");
  }

  if (complaint.assignedOfficerId !== userId) {
    throw new ApiError(403, "Only the assigned officer can reopen the complaint.");
  }

  if (complaint.status !== ComplaintStatus.DISPUTED) {
    throw new ApiError(400, "Only a disputed complaint can be reopened.");
  }

  return reopenComplaint(complaintId, userId, data.reason);
}

export async function closeComplaintService(complaintId: string, userId: string) {
  const complaint = await findComplaintById(complaintId);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found.");
  }

  if (complaint.status !== ComplaintStatus.RESOLVED) {
    throw new ApiError(400, "Only a resolved complaint can be closed.");
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const allowedRoles: RoleType[] = [
    RoleType.SUPER_ADMIN,
    RoleType.STATE_ADMIN,
    RoleType.DISTRICT_ADMIN,
    RoleType.MUNICIPAL_ADMIN,
    RoleType.DEPARTMENT_HEAD,
  ];

  if (!allowedRoles.includes(user.role.name)) {
    throw new ApiError(403, "Only authorized administrators can close a complaint.");
  }

  const resourceScope = {
    stateId: complaint.department.municipality?.district.state.id,
    districtId: complaint.department.municipality?.districtId,
    municipalityId: complaint.department.municipalityId ?? undefined,
    departmentId: complaint.departmentId,
  };

  const userScope = user.administrativeAssignment
    ? {
        stateId: user.administrativeAssignment.stateId ?? undefined,
        districtId: user.administrativeAssignment.districtId ?? undefined,
        municipalityId: user.administrativeAssignment.municipalityId ?? undefined,
        departmentId: user.administrativeAssignment.departmentId ?? undefined,
      }
    : undefined;

  if (!hasScopeAccess(user.role.name, userScope, resourceScope)) {
    throw new ApiError(
      403,
      "You are not authorized to close a complaint outside your administrative scope."
    );
  }

  return closeComplaint(complaintId, userId);
}

export async function getComplaintStatusHistoryService(complaintId: string, userId: string) {
  const complaint = await findComplaintById(complaintId);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found.");
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const allowedAdminRoles: RoleType[] = [
    RoleType.SUPER_ADMIN,
    RoleType.STATE_ADMIN,
    RoleType.DISTRICT_ADMIN,
    RoleType.MUNICIPAL_ADMIN,
    RoleType.DEPARTMENT_HEAD,
  ];

  const isCitizen = complaint.createdById === userId;
  const isAssignedOfficer = complaint.assignedOfficerId === userId;
  const isAdmin = allowedAdminRoles.includes(user.role.name);

  if (isCitizen || isAssignedOfficer) {
    return getComplaintStatusHistory(complaintId);
  }

  if (!isAdmin) {
    throw new ApiError(403, "You are not authorized to view this complaint history.");
  }

  const resourceScope = {
    stateId: complaint.department.municipality?.district.state.id,
    districtId: complaint.department.municipality?.districtId,
    municipalityId: complaint.department.municipalityId ?? undefined,
    departmentId: complaint.departmentId,
  };

  const userScope = user.administrativeAssignment
    ? {
        stateId: user.administrativeAssignment.stateId ?? undefined,
        districtId: user.administrativeAssignment.districtId ?? undefined,
        municipalityId: user.administrativeAssignment.municipalityId ?? undefined,
        departmentId: user.administrativeAssignment.departmentId ?? undefined,
      }
    : undefined;

  if (!hasScopeAccess(user.role.name, userScope, resourceScope)) {
    throw new ApiError(
      403,
      "You are not authorized to view this complaint history outside your administrative scope."
    );
  }

  return getComplaintStatusHistory(complaintId);
}
