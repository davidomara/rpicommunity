import { type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { CONTRIBUTION_APPROVAL_STATUS, TRANSACTION_TYPE } from "@/lib/domain-types";
import { getExpectedContributionAmount } from "@/lib/member-status";

type BalanceClient = Prisma.TransactionClient | typeof prisma;

export async function getCommunityBalance(db: BalanceClient) {
  const [contributions, withdrawals] = await Promise.all([
    db.transaction.aggregate({
      where: { type: TRANSACTION_TYPE.CONTRIBUTION },
      _sum: { amount: true }
    }),
    db.transaction.aggregate({
      where: { type: TRANSACTION_TYPE.WITHDRAWAL },
      _sum: { amount: true }
    })
  ]);

  return Number(contributions._sum.amount ?? 0) - Number(withdrawals._sum.amount ?? 0);
}

export async function getAvailableCommunityBalance(db: BalanceClient, now = new Date()) {
  const [contributionTotals, withdrawals] = await Promise.all([
    db.contribution.groupBy({
      by: ["memberId"],
      where: { approvalStatus: CONTRIBUTION_APPROVAL_STATUS.APPROVED },
      _sum: { amount: true }
    }),
    db.transaction.aggregate({
      where: { type: TRANSACTION_TYPE.WITHDRAWAL },
      _sum: { amount: true }
    })
  ]);

  const expectedAmount = getExpectedContributionAmount(now);
  const availableContributionPool = contributionTotals.reduce((sum, row) => {
    const approvedTotal = Number(row._sum.amount ?? 0);
    return sum + Math.min(approvedTotal, expectedAmount);
  }, 0);

  return Math.max(0, availableContributionPool - Number(withdrawals._sum.amount ?? 0));
}
