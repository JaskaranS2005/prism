import { ComplaintPriority, ComplaintStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { CreateComplaintInput } from "./types.js";

export async function createComplaint(userId: string, data: CreateComplaintInput) {
  return prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.create({
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

    await tx.complaintStatusHistory.create({
      data: {
        complaintId: complaint.id,
        status: ComplaintStatus.PENDING,
        changedById: userId,
        cycleNumber: 1,
        reason: "Complaint created.",
      },
    });

    return complaint;
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

export async function updateComplaintStatus(
  complaintId: string,
  status: ComplaintStatus,
  changedById: string,
  resolutionNote?: string
) {
  return prisma.$transaction(async (tx) => {
    const latestHistory = await tx.complaintStatusHistory.findFirst({
      where: {
        complaintId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const cycleNumber = latestHistory?.cycleNumber ?? 1;

    const complaint = await tx.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        status,
        ...(status === ComplaintStatus.RESOLVED && {
          resolvedAt: new Date(),
        }),
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

    await tx.complaintStatusHistory.create({
      data: {
        complaintId,
        status,
        changedById,
        resolutionNote: status === ComplaintStatus.RESOLVED ? resolutionNote : undefined,
        cycleNumber,
      },
    });

    return complaint;
  });
}

export async function disputeComplaint(complaintId: string, userId: string, reason: string) {
  return prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.findUnique({
      where: {
        id: complaintId,
      },
    });

    if (!complaint) {
      throw new Error("Complaint not found.");
    }

    const latestHistory = await tx.complaintStatusHistory.findFirst({
      where: {
        complaintId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!latestHistory) {
      throw new Error("Complaint status history not found.");
    }

    const updatedComplaint = await tx.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        status: ComplaintStatus.DISPUTED,
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

    await tx.complaintStatusHistory.create({
      data: {
        complaintId,
        status: ComplaintStatus.DISPUTED,
        changedById: userId,
        cycleNumber: latestHistory.cycleNumber,
        reason,
      },
    });

    return updatedComplaint;
  });
}
export async function reopenComplaint(complaintId: string, userId: string, reason: string) {
  return prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.findUnique({
      where: {
        id: complaintId,
      },
    });

    if (!complaint) {
      throw new Error("Complaint not found.");
    }

    const latestHistory = await tx.complaintStatusHistory.findFirst({
      where: {
        complaintId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!latestHistory) {
      throw new Error("Complaint status history not found.");
    }

    const newCycleNumber = latestHistory.cycleNumber + 1;

    const updatedComplaint = await tx.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        status: ComplaintStatus.REOPENED,
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

    await tx.complaintStatusHistory.create({
      data: {
        complaintId,
        status: ComplaintStatus.REOPENED,
        changedById: userId,
        cycleNumber: newCycleNumber,
        reason,
      },
    });

    return updatedComplaint;
  });
}
export async function closeComplaint(complaintId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const latestHistory = await tx.complaintStatusHistory.findFirst({
      where: {
        complaintId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const cycleNumber = latestHistory?.cycleNumber ?? 1;

    const complaint = await tx.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
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

    await tx.complaintStatusHistory.create({
      data: {
        complaintId,
        status: "CLOSED",
        changedById: userId,
        cycleNumber,
      },
    });

    return complaint;
  });
}

export async function getComplaintStatusHistory(complaintId: string) {
  return prisma.complaintStatusHistory.findMany({
    where: {
      complaintId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
