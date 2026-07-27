import { RoleType } from "@prisma/client";
import ApiError from "../../utils/ApiError.js";
import { hashPassword } from "../../utils/password.js";

import { createUser, findRoleByName, findUserByEmail, findUserByPhone } from "./repository.js";
import { RegisterUserInput } from "./types.js";

export async function registerUser(data: RegisterUserInput) {
  const existingEmail = await findUserByEmail(data.email);

  if (existingEmail) {
    throw new ApiError(409, "Email already exists.");
  }

  const existingPhone = await findUserByPhone(data.phone);

  if (existingPhone) {
    throw new ApiError(409, "Phone number already exists.");
  }

  const citizenRole = await findRoleByName(RoleType.CITIZEN);

  if (!citizenRole) {
    throw new ApiError(500, "Citizen role not found.");
  }

  const passwordHash = await hashPassword(data.password);

  return createUser({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    passwordHash,
    roleId: citizenRole.id,
  });
}
