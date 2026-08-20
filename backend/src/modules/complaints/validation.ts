import { z } from "zod";

export const createComplaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(150),

  description: z.string().min(20, "Description must be at least 20 characters.").max(5000),

  departmentId: z.uuid(),
});

export const assignComplaintSchema = z.object({
  officerId: z.uuid(),
});
export const updateComplaintStatusSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "IN_PROGRESS", "RESOLVED"]),
});
