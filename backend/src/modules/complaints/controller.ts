import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/ResponseWrapper.js";
import { createComplaintSchema } from "./validation.js";
import { createComplaintService } from "./service.js";
import { getMyComplaintsService } from "./service.js";

export async function createComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createComplaintSchema.parse(req.body);

    const complaint = await createComplaintService(req.user!.id, data);

    return res
      .status(201)
      .json(new ApiResponse(true, "Complaint created successfully.", complaint));
  } catch (error) {
    next(error);
  }
}
export async function getMyComplaints(req: Request, res: Response, next: NextFunction) {
  try {
    const complaints = await getMyComplaintsService(req.user!.id);

    return res
      .status(200)
      .json(new ApiResponse(true, "Complaints fetched successfully.", complaints));
  } catch (error) {
    next(error);
  }
}
