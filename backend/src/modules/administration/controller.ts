import { NextFunction, Request, Response } from "express";
import { RoleType } from "@prisma/client";

import { ApiResponse } from "../../utils/ResponseWrapper.js";
import { createGovernmentUserService } from "./service.js";
import { createGovernmentUserSchema } from "./validation.js";

export async function createGovernmentUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createGovernmentUserSchema.parse(req.body);

    const creator = req.user!;

    const user = await createGovernmentUserService(
      creator.id,
      creator.role as RoleType,
      creator.administrativeScope ?? null,
      data
    );

    return res
      .status(201)
      .json(new ApiResponse(true, "Government user created successfully.", user));
  } catch (error) {
    next(error);
  }
}
