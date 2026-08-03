import { ComplaintPriority, ComplaintStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { CreateComplaintInput } from "./types.js";

export async function createComplaint(userId: string, data: CreateComplaintInput) {
  return prisma.complaint.create({
    data: {
      title: data.title,
      description: data.description,

      status: ComplaintStatus.PENDING,
      priority: ComplaintPriority.MEDIUM,

      createdById: userId,
      departmentId: data.departmentId,
    },
    include: {
      department: true,
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });
}

export async function findDepartmentById(departmentId: string) {
  return prisma.department.findUnique({
    where: {
      id: departmentId,
    },
  });
}
export async function findComplaintsByUserId(userId: string) {
  return prisma.complaint.findMany({
    where: {
      createdById: userId,
    },
    include: {
      department: true,
      assignedOfficer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
export async function findComplaintById(id: string) {
  return prisma.complaint.findUnique({
    where: { id },
    include: {
      department: true,
      assignedOfficer: true,
    },
  });
}
export async function findUserById(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      role: true,
    },
  });
}

export async function assignComplaint(complaintId: string, officerId: string) {
  return prisma.complaint.update({
    where: {
      id: complaintId,
    },
    data: {
      assignedOfficerId: officerId,
    },
    include: {
      department: true,
      assignedOfficer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });
}

export async function findComplaintByIdWithRelations(complaintId: string) {
  return prisma.complaint.findUnique({
    where: {
      id: complaintId,
    },
    include: {
      department: true,
      assignedOfficer: true,
      createdBy: true,
    },
  });
}
