import { z } from "zod";

export const createComplaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(150),

  description: z.string().min(20, "Description must be at least 20 characters.").max(5000),

  departmentId: z.uuid(),
});

export const assignComplaintSchema = z.object({
  officerId: z.uuid(),
});
export const updateComplaintStatusSchema = z
  .object({
    status: z.enum(["PENDING", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED", "CLOSED"]),

    resolutionNote: z.string().min(10).max(1000).optional(),
  })
  .refine(
    (data) =>
      data.status !== "RESOLVED" ||
      (data.resolutionNote !== undefined && data.resolutionNote.trim().length >= 10),
    {
      message: "Resolution note is required when resolving a complaint.",
      path: ["resolutionNote"],
    }
  );
export const disputeComplaintSchema = z.object({
  reason: z
    .string()
    .min(10, "Dispute reason must be at least 10 characters.")
    .max(1000, "Dispute reason cannot exceed 1000 characters."),
});
export const reopenComplaintSchema = z.object({
  reason: z
    .string()
    .min(10, "Reopen reason must be at least 10 characters.")
    .max(1000, "Reopen reason cannot exceed 1000 characters."),
});
