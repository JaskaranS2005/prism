import { NextFunction, Request, Response } from "express";

import { ApiResponse } from "../../utils/apiResponse.js";
import { loginUser, registerUser } from "./service.js";
import { loginUserSchema, registerUserSchema } from "./validation.js";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedData = registerUserSchema.parse(req.body);

    const user = await registerUser(validatedData);

    res.status(201).json(new ApiResponse(true, "User registered successfully.", user));
  } catch (error) {
    next(error);
  }
}
export async function me(req: Request, res: Response) {
  return res.status(200).json(new ApiResponse(true, "Profile fetched successfully.", req.user));
}
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginUserSchema.parse(req.body);

    const result = await loginUser(data);

    return res.status(200).json(new ApiResponse(true, "Login successful.", result));
  } catch (error) {
    next(error);
  }
}
