import { RoleType } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      fullName: string;
      email: string;
      phone: string;
      isActive: boolean;
      isVerified: boolean;
      role: {
        name: RoleType;
      };
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
