import { EmergencyStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getArrearsAmount } from "@/lib/member-status";
import { syncAutoMemberStatuses } from "@/lib/member-status-sync";
import { sortCommunityRows } from "@/lib/community-order";

const communityRoles: Role[] = [Role.ADMIN, Role.TREASURER, Role.MEMBER];

export async function getDashboardData() {
  await syncAutoMemberStatuses();
  const [members, pendingRequests, totals] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: communityRoles } },
      include: {
        contributions: true,
        withdrawals: true,
        emergencyRequests: {
          where: { status: EmergencyStatus.PENDING }
        }
      }
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

  const memberRows = sortCommunityRows(members.map((member) => {
    const contributionTotal = member.contributions.reduce((sum, row) => sum + Number(row.amount), 0);
    const withdrawalTotal = member.withdrawals.reduce((sum, row) => sum + Number(row.amount), 0);
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      status: member.status,
      role: member.role,
      totalContributions: contributionTotal,
      totalWithdrawals: withdrawalTotal,
      missing: getArrearsAmount(contributionTotal),
      pendingEmergencyRequests: member.emergencyRequests.length
    };
  }));

  const summary = memberRows.reduce((acc, row) => {
    acc.totalContributions += row.totalContributions;
    acc.totalWithdrawals += row.totalWithdrawals;
    acc.totalArrears += row.missing;
    acc.pendingEmergencyRequests += row.pendingEmergencyRequests;
    acc.members += 1;
    if (row.status === "ACTIVE") acc.active += 1;
    if (row.status === "WARNING") acc.warning += 1;
    if (row.status === "CLOSED") acc.closed += 1;
    return acc;
  }, {
    totalContributions: 0,
    totalWithdrawals: 0,
    totalArrears: 0,
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
  await syncAutoMemberStatuses();
  const rows = await prisma.user.findMany({
    where: { role: { in: communityRoles } },
    include: {
      contributions: true,
      withdrawals: true,
      emergencyRequests: {
        where: { status: EmergencyStatus.PENDING }
      },
      targetedStatusChanges: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  return sortCommunityRows(rows);
}

export async function getMemberAccountDirectory() {
  const rows = await prisma.user.findMany({
    where: { role: Role.MEMBER },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      status: true
    }
  });

  return sortCommunityRows(rows);
}

export async function getContributionContext() {
  const members = await prisma.user.findMany({
    where: { role: { in: communityRoles } },
    select: { id: true, name: true, username: true }
  });

  const rows = await prisma.contribution.findMany({
    orderBy: [{ contributionDate: "desc" }, { createdAt: "desc" }],
    take: 200,
    select: {
      id: true,
      memberId: true,
      amount: true,
      contributionDate: true
    }
  });

  return { members: sortCommunityRows(members), rows };
}

export async function getWithdrawalContext() {
  const members = await prisma.user.findMany({
    where: { role: { in: communityRoles } },
    select: { id: true, name: true, username: true }
  });

  const rows = await prisma.withdrawal.findMany({
    orderBy: [{ withdrawalDate: "desc" }, { createdAt: "desc" }],
    take: 200,
    select: {
      id: true,
      memberId: true,
      amount: true,
      reason: true,
      withdrawalDate: true
    }
  });

  return { members: sortCommunityRows(members), rows };
}

export async function getEmergencyContext(memberId?: string, isAdmin = false) {
  const members = await prisma.user.findMany({
    where: { role: { in: communityRoles } },
    select: { id: true, name: true, username: true }
  });

  const filterId = isAdmin ? memberId : memberId;
  const rows = await prisma.emergencyRequest.findMany({
    where: filterId ? { memberId: filterId } : undefined,
    include: { member: true, adminApprovedBy: true, treasurerApprovedBy: true, rejectedBy: true, disbursedBy: true },
    orderBy: { requestDate: "desc" },
    take: 30
  });

  return { members: sortCommunityRows(members), rows };
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
