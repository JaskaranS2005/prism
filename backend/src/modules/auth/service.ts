import { RoleType } from "@prisma/client";
import ApiError from "../../utils/ApiError.js";
import { hashPassword } from "../../utils/password.js";

import { createUser, findRoleByName, findUserByEmail, findUserByPhone } from "./repository.js";
import { RegisterUserInput } from "./types.js";
import { comparePassword } from "../../utils/password.js";
import { generateAccessToken } from "../../config/jwt.js";
import { LoginUserInput } from "./types.js";
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
export async function loginUser(data: LoginUserInput) {
  const user = await findUserByEmail(data.email);

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated.");
  }

  const isPasswordValid = await comparePassword(data.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role.name,
  });

  return {
    accessToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      isVerified: user.isVerified,
    },
  };
}
