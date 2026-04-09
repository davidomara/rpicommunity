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
  temporaryPin: z.string().min(8),
  confirmTemporaryPin: z.string().min(8)
}).refine((data) => data.temporaryPin === data.confirmTemporaryPin, {
  message: "PINs do not match",
  path: ["confirmTemporaryPin"]
});

export const updateMemberStatusThresholdsSchema = z.object({
  warningAfterMonths: z.coerce.number().int().min(1),
  closeAfterMonths: z.coerce.number().int().min(1)
}).refine((data) => data.closeAfterMonths > data.warningAfterMonths, {
  message: "Close threshold must be greater than warning threshold",
  path: ["closeAfterMonths"]
});

export const requestMemberStatusChangeSchema = z.object({
  memberId: z.string().min(1),
  requestedStatus: z.enum(["ACTIVE", "WARNING", "CLOSED"])
});

export const decideMemberStatusChangeSchema = z.object({
  requestId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"])
});
