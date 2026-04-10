import { z } from "zod";

const requiredId = z.string().trim().min(1, "Selection is required");

export const updateEmailSchema = z.object({
  email: z.string().trim().email()
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().trim().min(6),
  newPassword: z.string().trim().min(8),
  confirmPassword: z.string().trim().min(8)
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const updateMemberEmailSchema = z.object({
  memberId: requiredId,
  email: z.string().trim().email()
});

export const resetMemberPinSchema = z.object({
  memberId: requiredId,
  newPin: z.string().trim().min(8),
  confirmPin: z.string().trim().min(8)
}).refine((data) => data.newPin === data.confirmPin, {
  message: "PINs do not match",
  path: ["confirmPin"]
});

export const createMemberSchema = z.object({
  name: z.string().trim().min(2),
  username: z.string().trim().min(3),
  email: z.string().trim().email(),
  temporaryPin: z.string().trim().min(8),
  confirmTemporaryPin: z.string().trim().min(8)
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
  memberId: requiredId,
  requestedStatus: z.enum(["ACTIVE", "WARNING", "CLOSED"])
});

export const decideMemberStatusChangeSchema = z.object({
  requestId: requiredId,
  decision: z.enum(["APPROVED", "REJECTED"])
});
