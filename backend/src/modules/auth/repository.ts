import { RoleType } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { RegisterUserInput } from "./types.js";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      passwordHash: true,
      role: {
        select: {
          name: true,
        },
      },
      isActive: true,
      isVerified: true,
    },
  });
}

export async function findUserByPhone(phone: string) {
  return prisma.user.findUnique({
    where: { phone },
  });
}

export async function findRoleByName(role: RoleType) {
  return prisma.role.findUnique({
    where: { name: role },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      isActive: true,
      isVerified: true,

      role: {
        select: {
          name: true,
        },
      },

      administrativeAssignment: {
        select: {
          stateId: true,
          districtId: true,
          municipalityId: true,
          departmentId: true,
        },
      },
    },
  });
}

export async function createUser(
  data: Omit<RegisterUserInput, "password"> & {
    passwordHash: string;
    roleId: string;
  }
) {
  return prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash: data.passwordHash,
      roleId: data.roleId,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,

      role: {
        select: {
          name: true,
        },
      },

      createdAt: true,
    },
  });
}
