import { z } from "zod";

import {
  createComplaintSchema,
  assignComplaintSchema,
  updateComplaintStatusSchema,
  disputeComplaintSchema,
  reopenComplaintSchema,
} from "./validation.js";

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type AssignComplaintInput = z.infer<typeof assignComplaintSchema>;
export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;
export type DisputeComplaintInput = z.infer<typeof disputeComplaintSchema>;
export type ReopenComplaintInput = z.infer<typeof reopenComplaintSchema>;
