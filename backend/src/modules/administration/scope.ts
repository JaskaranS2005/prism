import { RoleType } from "@prisma/client";

export interface AdministrativeScope {
  stateId?: string;
  districtId?: string;
  municipalityId?: string;
  departmentId?: string;
}

export function hasScopeAccess(
  role: RoleType,
  userScope: AdministrativeScope | null | undefined,
  resourceScope: AdministrativeScope
): boolean {
  if (role === RoleType.SUPER_ADMIN) {
    return true;
  }

  if (!userScope) {
    return false;
  }

  switch (role) {
    case RoleType.STATE_ADMIN:
      return !!userScope.stateId && userScope.stateId === resourceScope.stateId;

    case RoleType.DISTRICT_ADMIN:
      return !!userScope.districtId && userScope.districtId === resourceScope.districtId;

    case RoleType.MUNICIPAL_ADMIN:
      return (
        !!userScope.municipalityId && userScope.municipalityId === resourceScope.municipalityId
      );

    case RoleType.DEPARTMENT_HEAD:
      return !!userScope.departmentId && userScope.departmentId === resourceScope.departmentId;

    default:
      return false;
  }
}
