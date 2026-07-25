import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";

export default function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
}
