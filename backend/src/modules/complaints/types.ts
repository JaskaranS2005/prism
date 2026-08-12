import { z } from "zod";

import {
  createComplaintSchema,
  assignComplaintSchema,
  updateComplaintStatusSchema,
} from "./validation.js";

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;

export type AssignComplaintInput = z.infer<typeof assignComplaintSchema>;
export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;
