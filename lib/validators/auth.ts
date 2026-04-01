import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6)
});

export const requestPasswordResetSchema = z.object({
  identifier: z.string().min(3)
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8),
  confirmPassword: z.string().min(8)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
