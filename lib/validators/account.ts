import { z } from "zod";

export const updateEmailSchema = z.object({
  email: z.string().email()
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8)
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
