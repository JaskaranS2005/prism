import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../config/jwt.js";
import { findUserById } from "../modules/auth/repository.js";
import { RoleType } from "@prisma/client";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required.");
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyAccessToken(token);

    const user = await findUserById(payload.userId);

    if (!user) {
      throw new ApiError(401, "User not found.");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated.");
    }
    req.user = {
      id: user.id,
      role: user.role.name as RoleType,
      administrativeScope: user.administrativeAssignment
        ? {
            stateId: user.administrativeAssignment.stateId ?? undefined,
            districtId: user.administrativeAssignment.districtId ?? undefined,
            municipalityId: user.administrativeAssignment.municipalityId ?? undefined,
            departmentId: user.administrativeAssignment.departmentId ?? undefined,
          }
        : undefined,
    };

    next();
  } catch (error) {
    next(error);
  }
}
