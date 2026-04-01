"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageFinance } from "@/lib/rbac";
import { withdrawalSchema } from "@/lib/validators/finance";
import { revalidatePath } from "next/cache";

export type WithdrawalFormState = {
  success: boolean;
  error: string;
};

export async function createWithdrawalAction(_: WithdrawalFormState, formData: FormData): Promise<WithdrawalFormState> {
  const session = await auth();
  if (!session?.user || !canManageFinance(session.user.role)) {
    return {
      success: false,
      error: "Unauthorized"
    };
  }

  const parsed = withdrawalSchema.safeParse({
    memberId: String(formData.get("memberId") || ""),
    amount: formData.get("amount"),
    reason: String(formData.get("reason") || ""),
    withdrawalDate: String(formData.get("withdrawalDate") || "")
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid withdrawal details"
    };
  }

  const withdrawal = await prisma.withdrawal.create({
    data: {
      memberId: parsed.data.memberId,
      amount: parsed.data.amount,
      reason: parsed.data.reason,
      withdrawalDate: new Date(`${parsed.data.withdrawalDate}T00:00:00.000Z`),
      createdById: session.user.id
    }
  });

  await prisma.transaction.create({
    data: {
      memberId: parsed.data.memberId,
      type: "WITHDRAWAL",
      amount: parsed.data.amount,
      eventDate: withdrawal.withdrawalDate,
      actorId: session.user.id,
      notes: parsed.data.reason
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/members");
  revalidatePath("/withdrawals");

  return {
    success: true,
    error: ""
  };
}
