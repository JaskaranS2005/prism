import { RoleType } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError.js";

export function authorize(...allowedRoles: RoleType[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return next(new ApiError(403, "Access denied."));
    }

    next();
  };
}
