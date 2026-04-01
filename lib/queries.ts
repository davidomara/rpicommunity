import { EmergencyStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { EXPECTED_MONTHLY_CONTRIBUTION } from "@/lib/settings";

export async function getDashboardData() {
  const [members, pendingRequests, totals] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.MEMBER },
      include: {
        contributions: true,
        withdrawals: true,
        emergencyRequests: {
          where: { status: EmergencyStatus.PENDING }
        }
      },
      orderBy: { name: "asc" }
    }),
    prisma.emergencyRequest.findMany({
      where: { status: EmergencyStatus.PENDING },
      include: { member: true },
      orderBy: { requestDate: "desc" },
      take: 20
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true }
    })
  ]);

  const memberRows = members.map((member) => {
    const contributionTotal = member.contributions.reduce((sum, row) => sum + Number(row.amount), 0);
    const withdrawalTotal = member.withdrawals.reduce((sum, row) => sum + Number(row.amount), 0);
    const monthsActive = 12;
    const expected = monthsActive * EXPECTED_MONTHLY_CONTRIBUTION;
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      status: member.status,
      role: member.role,
      totalContributions: contributionTotal,
      totalWithdrawals: withdrawalTotal,
      missing: Math.max(0, expected - contributionTotal),
      pendingEmergencyRequests: member.emergencyRequests.length
    };
  });

  const summary = memberRows.reduce((acc, row) => {
    acc.totalContributions += row.totalContributions;
    acc.totalWithdrawals += row.totalWithdrawals;
    acc.pendingEmergencyRequests += row.pendingEmergencyRequests;
    acc.members += 1;
    if (row.status === "ACTIVE") acc.active += 1;
    if (row.status === "WARNING") acc.warning += 1;
    if (row.status === "CLOSED") acc.closed += 1;
    return acc;
  }, {
    totalContributions: 0,
    totalWithdrawals: 0,
    pendingEmergencyRequests: 0,
    members: 0,
    active: 0,
    warning: 0,
    closed: 0
  });

  return {
    members: memberRows,
    pendingRequests,
    summary: {
      ...summary,
      balance: summary.totalContributions - summary.totalWithdrawals
    }
  };
}

export async function getMembersDirectory() {
  return prisma.user.findMany({
    where: { role: Role.MEMBER },
    include: {
      contributions: true,
      withdrawals: true,
      emergencyRequests: {
        where: { status: EmergencyStatus.PENDING }
      }
    },
    orderBy: { name: "asc" }
  });
}

export async function getContributionContext(memberId?: string) {
  const members = await prisma.user.findMany({
    where: { role: Role.MEMBER },
    orderBy: { name: "asc" },
    select: { id: true, name: true, username: true }
  });

  const selectedId = memberId || members[0]?.id;
  const rows = selectedId ? await prisma.contribution.findMany({
    where: { memberId: selectedId },
    orderBy: { contributionDate: "desc" },
    take: 20
  }) : [];

  return { members, selectedId, rows };
}

export async function getWithdrawalContext(memberId?: string) {
  const members = await prisma.user.findMany({
    where: { role: Role.MEMBER },
    orderBy: { name: "asc" },
    select: { id: true, name: true, username: true }
  });

  const selectedId = memberId || members[0]?.id;
  const rows = selectedId ? await prisma.withdrawal.findMany({
    where: { memberId: selectedId },
    orderBy: { withdrawalDate: "desc" },
    take: 20
  }) : [];

  return { members, selectedId, rows };
}

export async function getEmergencyContext(memberId?: string, isAdmin = false) {
  const members = await prisma.user.findMany({
    where: { role: Role.MEMBER },
    orderBy: { name: "asc" },
    select: { id: true, name: true, username: true }
  });

  const filterId = isAdmin ? memberId : memberId;
  const rows = await prisma.emergencyRequest.findMany({
    where: filterId ? { memberId: filterId } : undefined,
    include: { member: true, decidedBy: true },
    orderBy: { requestDate: "desc" },
    take: 30
  });

  return { members, rows };
}

export async function getLatestBankStatement() {
  return prisma.bankStatement.findFirst({
    orderBy: { createdAt: "desc" }
  });
}

export async function getActiveConstitution() {
  return prisma.governingDocument.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  });
}
