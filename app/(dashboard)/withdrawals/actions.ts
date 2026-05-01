"use server";

import { auth } from "@/auth";
import { getCommunityBalance } from "@/lib/community-balance";
import { prisma } from "@/lib/db";
import { CONTRIBUTION_APPROVAL_STATUS, WITHDRAWAL_PURPOSE } from "@/lib/domain-types";
import { getAvailableSavingsAmount } from "@/lib/member-status";
import { getCurrentUserAuthorization, hasPermission } from "@/lib/rbac";
import { formatMoney } from "@/lib/utils";
import { withdrawalSchema } from "@/lib/validators/finance";
import { revalidatePath } from "next/cache";

export type WithdrawalFormState = {
  success: boolean;
  error: string;
  message: string;
};

export async function createWithdrawalAction(_: WithdrawalFormState, formData: FormData): Promise<WithdrawalFormState> {
  const session = await auth();
  const authorization = await getCurrentUserAuthorization();
  if (!session?.user || !authorization || !hasPermission(authorization, "withdrawals.create")) {
    return {
      success: false,
      error: "Unauthorized",
      message: ""
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
      error: parsed.error.issues[0]?.message || "Invalid withdrawal details",
      message: ""
    };
  }

  const member = await prisma.user.findUnique({
    where: { id: parsed.data.memberId },
    select: { id: true }
  });
  if (!member) {
    return {
      success: false,
      error: "Selected member was not found",
      message: ""
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const currentBalance = await getCommunityBalance(tx);
    const requestedAmount = parsed.data.amount;
    const [contributionTotals, savingsWithdrawalTotals] = await Promise.all([
      tx.contribution.aggregate({
        where: {
          memberId: parsed.data.memberId,
          approvalStatus: CONTRIBUTION_APPROVAL_STATUS.APPROVED
        },
        _sum: { amount: true }
      }),
      tx.withdrawal.aggregate({
        where: {
          memberId: parsed.data.memberId,
          purpose: WITHDRAWAL_PURPOSE.SAVINGS
        },
        _sum: { amount: true }
      })
    ]);
    const availableSavings = getAvailableSavingsAmount(
      Number(contributionTotals._sum.amount ?? 0),
      Number(savingsWithdrawalTotals._sum.amount ?? 0)
    );

    if (availableSavings <= 0) {
      return {
        success: false,
        error: "This member has no withdrawable savings yet. Only approved contributions above the expected monthly amount can be withdrawn.",
        message: ""
      };
    }

    if (requestedAmount > availableSavings) {
      return {
        success: false,
        error: `Insufficient savings. Available: ${formatMoney(availableSavings)}. Requested: ${formatMoney(requestedAmount)}.`,
        message: ""
      };
    }

    if (requestedAmount > currentBalance) {
      return {
        success: false,
        error: `Insufficient account balance. Available: ${formatMoney(currentBalance)}. Requested: ${formatMoney(requestedAmount)}.`,
        message: ""
      };
    }

    const withdrawal = await tx.withdrawal.create({
      data: {
        memberId: parsed.data.memberId,
        amount: parsed.data.amount,
        reason: parsed.data.reason,
        purpose: WITHDRAWAL_PURPOSE.SAVINGS,
        withdrawalDate: new Date(`${parsed.data.withdrawalDate}T00:00:00.000Z`),
        createdById: session.user.id
      }
    });

    await tx.transaction.create({
      data: {
        memberId: parsed.data.memberId,
        type: "WITHDRAWAL",
        amount: parsed.data.amount,
        eventDate: withdrawal.withdrawalDate,
        actorId: session.user.id,
        notes: parsed.data.reason
      }
    });

    const remainingBalance = currentBalance - requestedAmount;
    const remainingSavings = availableSavings - requestedAmount;

    return {
      success: true,
      error: "",
      message: `Withdrawal saved successfully. Remaining savings: ${formatMoney(remainingSavings)}. Account balance: ${formatMoney(remainingBalance)}.`
    };
  });

  if (!result.success) {
    return result;
  }

  revalidatePath("/dashboard");
  revalidatePath("/members");
  revalidatePath("/withdrawals");

  return result;
}
