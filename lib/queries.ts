import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { CONTRIBUTION_APPROVAL_STATUS, EMERGENCY_STATUS, COMMUNITY_ROLES, type Role } from "@/lib/domain-types";
import { getArrearsAmount, getSavingsAmount } from "@/lib/member-status";
import { syncAutoMemberStatuses } from "@/lib/member-status-sync";
import { sortCommunityRows } from "@/lib/community-order";
import { canManageFinance, canReviewContributionNotifications } from "@/lib/rbac";

const memberDirectoryArgs = {
  where: { role: { in: COMMUNITY_ROLES } },
  include: {
    contributions: {
      where: { approvalStatus: CONTRIBUTION_APPROVAL_STATUS.APPROVED }
    },
    withdrawals: true,
    emergencyRequests: {
      where: { status: EMERGENCY_STATUS.PENDING }
    },
    memberStatusChanges: {
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 1
    }
  }
} satisfies Prisma.UserFindManyArgs;

export type MemberDirectoryRow = Prisma.UserGetPayload<{ 
  include: typeof memberDirectoryArgs.include 
}>;

export async function getDashboardData() {
  await syncAutoMemberStatuses();
  const [members, pendingRequests] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: COMMUNITY_ROLES } },
      include: {
        contributions: {
          where: { approvalStatus: CONTRIBUTION_APPROVAL_STATUS.APPROVED }
        },
        withdrawals: true,
        emergencyRequests: {
          where: { status: EMERGENCY_STATUS.PENDING }
        }
      }
    }),
    prisma.emergencyRequest.findMany({
      where: { status: EMERGENCY_STATUS.PENDING },
      include: { member: true },
      orderBy: { requestDate: "desc" },
      take: 20
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
      savings: getSavingsAmount(contributionTotal),
      pendingEmergencyRequests: member.emergencyRequests.length
    };
  }));

  const summary = memberRows.reduce((acc, row) => {
    acc.totalContributions += row.totalContributions;
    acc.totalWithdrawals += row.totalWithdrawals;
    acc.totalArrears += row.missing;
    acc.totalSavings += row.savings;
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
    totalSavings: 0,
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
      balance: summary.totalContributions - summary.totalWithdrawals,
      availableBalance: Math.max(0, summary.totalContributions - summary.totalWithdrawals - summary.totalSavings)
    }
  };
}

export async function getMembersDirectory(): Promise<MemberDirectoryRow[]> {
  await syncAutoMemberStatuses();
  const rows = await prisma.user.findMany(memberDirectoryArgs);

  return sortCommunityRows(rows);
}

export async function getMemberAccountDirectory() {
  const rows = await prisma.user.findMany({
    where: { role: "MEMBER" },
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

export async function getContributionContextForRole(role: Role, userId: string) {
  const staffView = canManageFinance(role);
  const memberWhere = staffView
    ? { role: { in: COMMUNITY_ROLES } }
    : { id: userId };

  const members = await prisma.user.findMany({
    where: memberWhere,
    select: { id: true, name: true, username: true }
  });

  const rows = await prisma.contribution.findMany({
    where: staffView
      ? undefined
      : { memberId: userId },
    orderBy: [{ contributionDate: "desc" }, { createdAt: "desc" }],
    take: 200,
    select: {
      id: true,
      memberId: true,
      amount: true,
      contributionDate: true,
      approvalStatus: true,
      createdAt: true
    }
  });

  return { members: sortCommunityRows(members), rows, staffView };
}

export async function getContributionNotifications(role: Role) {
  const rows = await prisma.contribution.findMany({
    include: {
      member: {
        select: { id: true, name: true, username: true }
      },
      createdBy: {
        select: { id: true, name: true, username: true }
      },
      approvedBy: {
        select: { id: true, name: true, username: true }
      },
      rejectedBy: {
        select: { id: true, name: true, username: true }
      }
    },
    orderBy: [{ createdAt: "desc" }],
    take: 200
  });

  return { rows, adminReview: canReviewContributionNotifications(role) };
}

export async function getNotificationCount(role: Role, userId: string) {
  const [pendingContributionCount, pendingEmergencyCount] = await Promise.all([
    prisma.contribution.count({
      where: { approvalStatus: CONTRIBUTION_APPROVAL_STATUS.PENDING }
    }),
    prisma.emergencyRequest.count({
      where: { status: EMERGENCY_STATUS.PENDING }
    })
  ]);

  return pendingContributionCount + pendingEmergencyCount;
}

export async function getWithdrawalContext() {
  const members = await prisma.user.findMany({
    where: { role: { in: COMMUNITY_ROLES } },
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
    where: { role: { in: COMMUNITY_ROLES } },
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
