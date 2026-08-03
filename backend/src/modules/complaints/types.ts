import { z } from "zod";

import { createComplaintSchema, assignComplaintSchema } from "./validation.js";

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;

export type AssignComplaintInput = z.infer<typeof assignComplaintSchema>;
