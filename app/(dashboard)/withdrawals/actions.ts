"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageFinance } from "@/lib/rbac";
import { withdrawalSchema } from "@/lib/validators/finance";
import { revalidatePath } from "next/cache";

export async function createWithdrawalAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageFinance(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const parsed = withdrawalSchema.parse({
    memberId: String(formData.get("memberId") || ""),
    amount: formData.get("amount"),
    reason: String(formData.get("reason") || ""),
    withdrawalDate: String(formData.get("withdrawalDate") || "")
  });

  const withdrawal = await prisma.withdrawal.create({
    data: {
      memberId: parsed.memberId,
      amount: parsed.amount,
      reason: parsed.reason,
      withdrawalDate: new Date(`${parsed.withdrawalDate}T00:00:00.000Z`),
      createdById: session.user.id
    }
  });

  await prisma.transaction.create({
    data: {
      memberId: parsed.memberId,
      type: "WITHDRAWAL",
      amount: parsed.amount,
      eventDate: withdrawal.withdrawalDate,
      actorId: session.user.id,
      notes: parsed.reason
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/members");
  revalidatePath("/withdrawals");
}
