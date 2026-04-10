import { z } from "zod";
import { getTodayISODate } from "@/lib/utils";

const requiredId = z.string().trim().min(1, "Selection is required");
const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "A valid date is required");
const positiveAmount = z.coerce.number().positive("Amount must be greater than zero");

export const contributionSchema = z.object({
  memberId: requiredId,
  amount: positiveAmount,
  contributionDate: isoDate.refine((value) => value <= getTodayISODate(), {
    message: "Contribution date cannot be in the future"
  })
});

export const withdrawalSchema = z.object({
  memberId: requiredId,
  amount: positiveAmount,
  reason: z.string().trim().min(3, "Reason must be at least 3 characters"),
  withdrawalDate: isoDate.refine((value) => value <= getTodayISODate(), {
    message: "Withdrawal date cannot be in the future"
  })
});

export const emergencyRequestSchema = z.object({
  memberId: requiredId,
  amount: positiveAmount,
  reason: z.string().trim().min(5, "Reason must be at least 5 characters")
});

export const emergencyDecisionSchema = z.object({
  requestId: requiredId,
  status: z.enum(["APPROVED", "REJECTED"]),
  disbursementAmount: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    positiveAmount.optional()
  )
});
