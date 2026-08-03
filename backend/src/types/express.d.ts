import "express";
import { RoleType } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: RoleType;
      };
    }
  }
}

export {};
