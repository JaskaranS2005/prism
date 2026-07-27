import { z } from "zod";

export const registerUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters.")
    .max(100, "Full name cannot exceed 100 characters."),

  email: z.email("Invalid email address.").trim().toLowerCase(),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(64, "Password cannot exceed 64 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character."),
});

export const loginUserSchema = z.object({
  email: z.email("Invalid email address.").trim().toLowerCase(),

  password: z.string().min(1, "Password is required."),
});

export type RegisterUserSchema = z.infer<typeof registerUserSchema>;
export type LoginUserSchema = z.infer<typeof loginUserSchema>;
