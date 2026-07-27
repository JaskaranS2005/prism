import { NextFunction, Request, Response } from "express";

import { ApiResponse } from "../../utils/apiResponse.js";

import { registerUser } from "./service.js";
import { registerUserSchema } from "./validation.js";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedData = registerUserSchema.parse(req.body);

    const user = await registerUser(validatedData);

    res.status(201).json(new ApiResponse(true, "User registered successfully.", user));
  } catch (error) {
    next(error);
  }
}
