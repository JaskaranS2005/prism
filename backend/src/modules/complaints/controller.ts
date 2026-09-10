import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/ResponseWrapper.js";
import {
  assignComplaintSchema,
  createComplaintSchema,
  updateComplaintStatusSchema,
} from "./validation.js";
import { assignComplaintService, getComplaintStatusHistoryService } from "./service.js";
import {
  createComplaintService,
  getComplaintByIdService,
  getMyComplaintsService,
  updateComplaintStatusService,
  closeComplaintService,
} from "./service.js";
import { disputeComplaintService } from "./service.js";
import { disputeComplaintSchema } from "./validation.js";
import { reopenComplaintService } from "./service.js";
import { reopenComplaintSchema } from "./validation.js";

type ComplaintParams = {
  id: string;
};

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

export async function getComplaintById(
  req: Request<ComplaintParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const complaint = await getComplaintByIdService(req.params.id, req.user!.id);

    return res
      .status(200)
      .json(new ApiResponse(true, "Complaint fetched successfully.", complaint));
  } catch (error) {
    next(error);
  }
}

export async function assignComplaint(
  req: Request<ComplaintParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const data = assignComplaintSchema.parse(req.body);

    const complaint = await assignComplaintService(req.params.id, req.user!.id, data);

    return res
      .status(200)
      .json(new ApiResponse(true, "Complaint assigned successfully.", complaint));
  } catch (error) {
    next(error);
  }
}
export async function updateComplaintStatus(
  req: Request<ComplaintParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const data = updateComplaintStatusSchema.parse(req.body);

    const complaint = await updateComplaintStatusService(req.params.id, req.user!.id, data);

    return res
      .status(200)
      .json(new ApiResponse(true, "Complaint status updated successfully.", complaint));
  } catch (error) {
    next(error);
  }
}

export async function disputeComplaint(
  req: Request<ComplaintParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const data = disputeComplaintSchema.parse(req.body);

    const complaint = await disputeComplaintService(req.params.id, req.user!.id, data);

    return res
      .status(200)
      .json(new ApiResponse(true, "Complaint disputed successfully.", complaint));
  } catch (error) {
    next(error);
  }
}
export async function reopenComplaint(
  req: Request<ComplaintParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const data = reopenComplaintSchema.parse(req.body);

    const complaint = await reopenComplaintService(req.params.id, req.user!.id, data);

    return res
      .status(200)
      .json(new ApiResponse(true, "Complaint reopened successfully.", complaint));
  } catch (error) {
    next(error);
  }
}

export async function closeComplaint(
  req: Request<{ complaintId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const complaintId = req.params.complaintId;
    const userId = req.user!.id;

    const complaint = await closeComplaintService(complaintId, userId);

    return res.status(200).json({
      success: true,
      message: "Complaint closed successfully.",
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
}

export async function getComplaintStatusHistory(
  req: Request<{ complaintId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const complaintId = req.params.complaintId;
    const userId = req.user!.id;

    const history = await getComplaintStatusHistoryService(complaintId, userId);

    return res.status(200).json({
      success: true,
      message: "Complaint status history fetched successfully.",
      data: history,
    });
  } catch (error) {
    next(error);
  }
}
