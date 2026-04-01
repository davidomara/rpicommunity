import { z } from "zod";
import { getTodayISODate } from "@/lib/utils";

export const contributionSchema = z.object({
  memberId: z.string().min(1),
  amount: z.coerce.number().positive(),
  contributionDate: z.string().refine((value) => value <= getTodayISODate(), {
    message: "Contribution date cannot be in the future"
  })
});

export const withdrawalSchema = z.object({
  memberId: z.string().min(1),
  amount: z.coerce.number().positive(),
  reason: z.string().min(3),
  withdrawalDate: z.string().refine((value) => value <= getTodayISODate(), {
    message: "Withdrawal date cannot be in the future"
  })
});

export const emergencyRequestSchema = z.object({
  memberId: z.string().min(1),
  amount: z.coerce.number().positive(),
  reason: z.string().min(5)
});

export const emergencyDecisionSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"])
});
