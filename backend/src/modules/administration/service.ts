import { RoleType } from "@prisma/client";
import ApiError from "../../utils/ApiError.js";
import { hashPassword } from "../../utils/password.js";

import {
  createGovernmentUser,
  findDepartmentById,
  findDistrictById,
  findMunicipalityById,
  findRoleByName,
  findStateById,
  findUserByEmail,
  findUserByPhone,
} from "./repository.js";

import { CreateGovernmentUserInput } from "./types.js";

const allowedChildRoles: Partial<Record<RoleType, RoleType>> = {
  SUPER_ADMIN: RoleType.STATE_ADMIN,
  STATE_ADMIN: RoleType.DISTRICT_ADMIN,
  DISTRICT_ADMIN: RoleType.MUNICIPAL_ADMIN,
  MUNICIPAL_ADMIN: RoleType.DEPARTMENT_HEAD,
  DEPARTMENT_HEAD: RoleType.OFFICER,
};

export async function createGovernmentUserService(
  creatorId: string,
  creatorRole: RoleType,
  creatorScope: {
    stateId?: string;
    districtId?: string;
    municipalityId?: string;
    departmentId?: string;
  } | null,
  data: CreateGovernmentUserInput
) {
  const requestedRole = data.role as RoleType;

  const expectedChildRole = allowedChildRoles[creatorRole];

  if (!expectedChildRole) {
    throw new ApiError(403, "You are not authorized to create government users.");
  }

  if (requestedRole !== expectedChildRole) {
    throw new ApiError(403, `You can only create ${expectedChildRole} users.`);
  }

  const existingEmail = await findUserByEmail(data.email);

  if (existingEmail) {
    throw new ApiError(409, "Email already exists.");
  }

  const existingPhone = await findUserByPhone(data.phone);

  if (existingPhone) {
    throw new ApiError(409, "Phone number already exists.");
  }

  const role = await findRoleByName(requestedRole);

  if (!role) {
    throw new ApiError(500, "Requested role does not exist.");
  }

  if (requestedRole === RoleType.STATE_ADMIN) {
    if (!data.stateId) {
      throw new ApiError(400, "State is required for a state administrator.");
    }

    const state = await findStateById(data.stateId);

    if (!state || !state.isActive) {
      throw new ApiError(404, "State not found or inactive.");
    }
  }

  if (requestedRole === RoleType.DISTRICT_ADMIN) {
    if (!data.stateId || !data.districtId) {
      throw new ApiError(400, "State and district are required for a district administrator.");
    }

    const district = await findDistrictById(data.districtId);

    if (!district || !district.isActive) {
      throw new ApiError(404, "District not found or inactive.");
    }

    if (district.stateId !== data.stateId) {
      throw new ApiError(400, "District does not belong to the selected state.");
    }

    if (creatorRole === RoleType.STATE_ADMIN) {
      if (creatorScope?.stateId !== data.stateId) {
        throw new ApiError(
          403,
          "You can only create district administrators within your assigned state."
        );
      }
    }
  }

  if (requestedRole === RoleType.MUNICIPAL_ADMIN) {
    if (!data.stateId || !data.districtId || !data.municipalityId) {
      throw new ApiError(
        400,
        "State, district, and municipality are required for a municipal administrator."
      );
    }

    const municipality = await findMunicipalityById(data.municipalityId);

    if (!municipality || !municipality.isActive) {
      throw new ApiError(404, "Municipality not found or inactive.");
    }

    if (municipality.districtId !== data.districtId) {
      throw new ApiError(400, "Municipality does not belong to the selected district.");
    }

    const district = await findDistrictById(data.districtId);

    if (!district || district.stateId !== data.stateId) {
      throw new ApiError(400, "District does not belong to the selected state.");
    }

    if (creatorRole === RoleType.DISTRICT_ADMIN) {
      if (creatorScope?.districtId !== data.districtId) {
        throw new ApiError(
          403,
          "You can only create municipal administrators within your assigned district."
        );
      }
    }
  }

  if (requestedRole === RoleType.DEPARTMENT_HEAD) {
    if (!data.stateId || !data.districtId || !data.municipalityId || !data.departmentId) {
      throw new ApiError(
        400,
        "State, district, municipality, and department are required for a department head."
      );
    }

    const department = await findDepartmentById(data.departmentId);

    if (!department || !department.isActive) {
      throw new ApiError(404, "Department not found or inactive.");
    }

    if (department.municipalityId !== data.municipalityId) {
      throw new ApiError(400, "Department does not belong to the selected municipality.");
    }

    const municipality = await findMunicipalityById(data.municipalityId);

    if (!municipality || municipality.districtId !== data.districtId) {
      throw new ApiError(400, "Municipality does not belong to the selected district.");
    }

    const district = await findDistrictById(data.districtId);

    if (!district || district.stateId !== data.stateId) {
      throw new ApiError(400, "District does not belong to the selected state.");
    }

    if (creatorRole === RoleType.MUNICIPAL_ADMIN) {
      if (creatorScope?.municipalityId !== data.municipalityId) {
        throw new ApiError(
          403,
          "You can only create department heads within your assigned municipality."
        );
      }
    }
  }

  if (requestedRole === RoleType.OFFICER) {
    if (!data.stateId || !data.districtId || !data.municipalityId || !data.departmentId) {
      throw new ApiError(400, "Complete administrative scope is required for an officer.");
    }

    const department = await findDepartmentById(data.departmentId);

    if (!department || !department.isActive) {
      throw new ApiError(404, "Department not found or inactive.");
    }

    if (department.municipalityId !== data.municipalityId) {
      throw new ApiError(400, "Department does not belong to the selected municipality.");
    }

    const municipality = await findMunicipalityById(data.municipalityId);

    if (!municipality || municipality.districtId !== data.districtId) {
      throw new ApiError(400, "Municipality does not belong to the selected district.");
    }

    const district = await findDistrictById(data.districtId);

    if (!district || district.stateId !== data.stateId) {
      throw new ApiError(400, "District does not belong to the selected state.");
    }

    if (creatorRole === RoleType.DEPARTMENT_HEAD) {
      if (creatorScope?.departmentId !== data.departmentId) {
        throw new ApiError(403, "You can only create officers within your assigned department.");
      }
    }
  }

  const passwordHash = await hashPassword(data.password);

  return createGovernmentUser({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    passwordHash,
    roleId: role.id,
    stateId: data.stateId,
    districtId: data.districtId,
    municipalityId: data.municipalityId,
    departmentId: data.departmentId,
  });
}
