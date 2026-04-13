import { TransactionType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type BalanceClient = Prisma.TransactionClient | typeof prisma;

export async function getCommunityBalance(db: BalanceClient) {
  const [contributions, withdrawals] = await Promise.all([
    db.transaction.aggregate({
      where: { type: TransactionType.CONTRIBUTION },
      _sum: { amount: true }
    }),
    db.transaction.aggregate({
      where: { type: TransactionType.WITHDRAWAL },
      _sum: { amount: true }
    })
  ]);

  return Number(contributions._sum.amount ?? 0) - Number(withdrawals._sum.amount ?? 0);
}
