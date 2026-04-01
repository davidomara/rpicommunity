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

export const updateMemberEmailSchema = z.object({
  memberId: z.string().min(1),
  email: z.string().email()
});

export const resetMemberPinSchema = z.object({
  memberId: z.string().min(1),
  newPin: z.string().min(8),
  confirmPin: z.string().min(8)
}).refine((data) => data.newPin === data.confirmPin, {
  message: "PINs do not match",
  path: ["confirmPin"]
});

export const createMemberSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  status: z.enum(["ACTIVE", "WARNING", "CLOSED"]),
  temporaryPin: z.string().min(8),
  confirmTemporaryPin: z.string().min(8)
}).refine((data) => data.temporaryPin === data.confirmTemporaryPin, {
  message: "PINs do not match",
  path: ["confirmTemporaryPin"]
});
