import "express";
import type { RoleType } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: RoleType;
        administrativeScope?: {
          stateId?: string;
          districtId?: string;
          municipalityId?: string;
          departmentId?: string;
        };
      };
    }
  }
}

export {};
