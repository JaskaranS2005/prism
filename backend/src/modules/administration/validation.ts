import { z } from "zod";

export const createGovernmentUserSchema = z.object({
  fullName: z.string().min(2).max(100),

  email: z.string().email(),

  phone: z.string().min(10).max(15),

  password: z.string().min(8),

  role: z.enum(["STATE_ADMIN", "DISTRICT_ADMIN", "MUNICIPAL_ADMIN", "DEPARTMENT_HEAD", "OFFICER"]),

  stateId: z.string().uuid().optional(),
  districtId: z.string().uuid().optional(),
  municipalityId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
});
