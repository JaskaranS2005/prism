import { prisma } from "../../lib/prisma.js";
import { RoleType } from "@prisma/client";
export async function findRoleByName(roleName: RoleType) {
  return prisma.role.findUnique({
    where: {
      name: roleName,
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findUserByPhone(phone: string) {
  return prisma.user.findUnique({
    where: { phone },
  });
}

export async function findStateById(stateId: string) {
  return prisma.state.findUnique({
    where: { id: stateId },
  });
}

export async function findDistrictById(districtId: string) {
  return prisma.district.findUnique({
    where: { id: districtId },
  });
}

export async function findMunicipalityById(municipalityId: string) {
  return prisma.municipality.findUnique({
    where: { id: municipalityId },
  });
}

export async function findDepartmentById(departmentId: string) {
  return prisma.department.findUnique({
    where: { id: departmentId },
  });
}

export async function createGovernmentUser(data: {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  roleId: string;
  stateId?: string;
  districtId?: string;
  municipalityId?: string;
  departmentId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
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

    await tx.administrativeAssignment.create({
      data: {
        userId: user.id,
        stateId: data.stateId,
        districtId: data.districtId,
        municipalityId: data.municipalityId,
        departmentId: data.departmentId,
      },
    });

    return user;
  });
}
