import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { CONTRIBUTION_APPROVAL_STATUS, EMERGENCY_STATUS, COMMUNITY_ROLES, WITHDRAWAL_PURPOSE } from "@/lib/domain-types";
import { getArrearsAmount, getAvailableSavingsAmount } from "@/lib/member-status";
import { syncAutoMemberStatuses } from "@/lib/member-status-sync";
import { sortCommunityRows } from "@/lib/community-order";
import { deriveLegacyAccessRoleKey, getAccessRoleLabel, hasPermission, type AuthorizationContext } from "@/lib/rbac";

const memberDirectoryArgs = {
  where: { role: { in: COMMUNITY_ROLES } },
  select: {
    id: true,
    name: true,
    username: true,
    email: true,
    role: true,
    status: true,
    memberStatusChanges: {
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 1,
      select: {
        id: true,
        currentStatus: true,
        requestedStatus: true,
        adminApprovedAt: true,
        treasurerApprovedAt: true
      }
    }
  }
} satisfies Prisma.UserFindManyArgs;

type MemberDirectoryBaseRow = Prisma.UserGetPayload<{
  select: typeof memberDirectoryArgs.select;
}>;

export type MemberDirectoryRow = MemberDirectoryBaseRow & {
  totalContributions: number;
  totalWithdrawals: number;
  totalSavingsWithdrawals: number;
};

export type MemberAccountDirectoryRow = {
  id: string;
  name: string;
  username: string;
  email: string;
  status: string;
};

export type UserAccessAssignmentRow = {
  id: string;
  name: string;
  username: string;
  email: string;
  status: string;
  legacyRole: string;
  assignedAccessRoleId: string | null;
  assignedAccessRoleKey: string | null;
  assignedAccessRoleName: string | null;
  effectiveAccessRoleKey: string;
  effectiveAccessRoleName: string;
  accessSource: "assigned" | "legacy";
};

export type AccessRoleOverviewRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissionKeys: string[];
  permissionCount: number;
  userCount: number;
};

export type MemberOptionRow = {
  id: string;
  name: string;
  username: string;
};

export type DashboardMemberRow = {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  totalContributions: number;
  totalWithdrawals: number;
  missing: number;
  savings: number;
  pendingEmergencyRequests: number;
};

export type DashboardPendingRequestRow = Prisma.EmergencyRequestGetPayload<{
  include: { member: true };
}>;

export type DashboardSummary = {
  totalContributions: number;
  totalWithdrawals: number;
  totalArrears: number;
  totalSavings: number;
  pendingEmergencyRequests: number;
  members: number;
  active: number;
  warning: number;
  closed: number;
  balance: number;
  availableBalance: number;
};

export async function getDashboardData(): Promise<{
  members: DashboardMemberRow[];
  pendingRequests: DashboardPendingRequestRow[];
  summary: DashboardSummary;
}> {
  await syncAutoMemberStatuses();
  const [
    members,
    contributionTotals,
    withdrawalTotals,
    savingsWithdrawalTotals,
    pendingEmergencyCounts,
    pendingRequests
  ] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: COMMUNITY_ROLES } },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: true
      }
    }),
    prisma.contribution.groupBy({
      by: ["memberId"],
      where: { approvalStatus: CONTRIBUTION_APPROVAL_STATUS.APPROVED },
      _sum: { amount: true }
    }),
    prisma.withdrawal.groupBy({
      by: ["memberId"],
      _sum: { amount: true }
    }),
    prisma.withdrawal.groupBy({
      by: ["memberId"],
      where: { purpose: WITHDRAWAL_PURPOSE.SAVINGS },
      _sum: { amount: true }
    }),
    prisma.emergencyRequest.groupBy({
      by: ["memberId"],
      where: { status: EMERGENCY_STATUS.PENDING },
      _count: { _all: true }
    }),
    prisma.emergencyRequest.findMany({
      where: { status: EMERGENCY_STATUS.PENDING },
      include: { member: true },
      orderBy: { requestDate: "desc" },
      take: 20
    })
  ]);

  const contributionTotalByMemberId = new Map(
    contributionTotals.map((row) => [row.memberId, Number(row._sum.amount ?? 0)])
  );
  const withdrawalTotalByMemberId = new Map(
    withdrawalTotals.map((row) => [row.memberId, Number(row._sum.amount ?? 0)])
  );
  const savingsWithdrawalTotalByMemberId = new Map(
    savingsWithdrawalTotals.map((row) => [row.memberId, Number(row._sum.amount ?? 0)])
  );
  const pendingEmergencyCountByMemberId = new Map(
    pendingEmergencyCounts.map((row) => [row.memberId, row._count._all])
  );

  const memberRows = sortCommunityRows<DashboardMemberRow>(members.map((member) => {
    const contributionTotal = contributionTotalByMemberId.get(member.id) ?? 0;
    const withdrawalTotal = withdrawalTotalByMemberId.get(member.id) ?? 0;
    const savingsWithdrawalTotal = savingsWithdrawalTotalByMemberId.get(member.id) ?? 0;
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      status: member.status,
      role: member.role,
      totalContributions: contributionTotal,
      totalWithdrawals: withdrawalTotal,
      missing: getArrearsAmount(contributionTotal),
      savings: getAvailableSavingsAmount(contributionTotal, savingsWithdrawalTotal),
      pendingEmergencyRequests: pendingEmergencyCountByMemberId.get(member.id) ?? 0
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
  const [rows, contributionTotals, withdrawalTotals, savingsWithdrawalTotals] = await Promise.all([
    prisma.user.findMany(memberDirectoryArgs),
    prisma.contribution.groupBy({
      by: ["memberId"],
      where: { approvalStatus: CONTRIBUTION_APPROVAL_STATUS.APPROVED },
      _sum: { amount: true }
    }),
    prisma.withdrawal.groupBy({
      by: ["memberId"],
      _sum: { amount: true }
    }),
    prisma.withdrawal.groupBy({
      by: ["memberId"],
      where: { purpose: WITHDRAWAL_PURPOSE.SAVINGS },
      _sum: { amount: true }
    })
  ]);

  const contributionTotalByMemberId = new Map(
    contributionTotals.map((row) => [row.memberId, Number(row._sum.amount ?? 0)])
  );
  const withdrawalTotalByMemberId = new Map(
    withdrawalTotals.map((row) => [row.memberId, Number(row._sum.amount ?? 0)])
  );
  const savingsWithdrawalTotalByMemberId = new Map(
    savingsWithdrawalTotals.map((row) => [row.memberId, Number(row._sum.amount ?? 0)])
  );

  return sortCommunityRows<MemberDirectoryRow>(rows.map((member) => ({
    ...member,
    totalContributions: contributionTotalByMemberId.get(member.id) ?? 0,
    totalWithdrawals: withdrawalTotalByMemberId.get(member.id) ?? 0,
    totalSavingsWithdrawals: savingsWithdrawalTotalByMemberId.get(member.id) ?? 0
  })));
}

export async function getMemberAccountDirectory(): Promise<MemberAccountDirectoryRow[]> {
  const rows = await prisma.user.findMany({
    where: { role: { in: COMMUNITY_ROLES } },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      status: true
    }
  });

  return sortCommunityRows<MemberAccountDirectoryRow>(rows);
}

export async function getContributionContextForAuthorization(
  authorization: AuthorizationContext
): Promise<{
  members: MemberOptionRow[];
  rows: Array<{
    id: string;
    memberId: string;
    amount: Prisma.Decimal;
    contributionDate: Date;
    approvalStatus: string;
    createdAt: Date;
  }>;
  staffView: boolean;
}> {
  const staffView = hasPermission(authorization, "contributions.view_all");
  const memberWhere = staffView
    ? { role: { in: COMMUNITY_ROLES } }
    : { id: authorization.userId };

  const members = await prisma.user.findMany({
    where: memberWhere,
    select: { id: true, name: true, username: true }
  });

  const rows = await prisma.contribution.findMany({
    where: staffView
      ? undefined
      : { memberId: authorization.userId },
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

  return { members: sortCommunityRows<MemberOptionRow>(members), rows, staffView };
}

export async function getContributionNotifications() {
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

  return { rows };
}

export async function getNotificationCount(authorization: AuthorizationContext | null) {
  if (!authorization || !hasPermission(authorization, "notifications.view")) {
    return 0;
  }

  const counts = await Promise.all([
    hasPermission(authorization, "contributions.review")
      ? prisma.contribution.count({
          where: { approvalStatus: CONTRIBUTION_APPROVAL_STATUS.PENDING }
        })
      : Promise.resolve(0),
    hasPermission(authorization, "emergency_requests.review")
      ? prisma.emergencyRequest.count({
          where: { status: EMERGENCY_STATUS.PENDING }
        })
      : Promise.resolve(0)
  ]);

  return counts[0] + counts[1];
}

export async function getWithdrawalContext() {
  const [members, contributionTotals, savingsWithdrawalTotals, rows] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: COMMUNITY_ROLES } },
      select: {
        id: true,
        name: true,
        username: true
      }
    }),
    prisma.contribution.groupBy({
      by: ["memberId"],
      where: { approvalStatus: CONTRIBUTION_APPROVAL_STATUS.APPROVED },
      _sum: { amount: true }
    }),
    prisma.withdrawal.groupBy({
      by: ["memberId"],
      where: { purpose: WITHDRAWAL_PURPOSE.SAVINGS },
      _sum: { amount: true }
    }),
    prisma.withdrawal.findMany({
      orderBy: [{ withdrawalDate: "desc" }, { createdAt: "desc" }],
      take: 200,
      select: {
        id: true,
        memberId: true,
        amount: true,
        reason: true,
        withdrawalDate: true
      }
    })
  ]);

  const contributionTotalByMemberId = new Map(
    contributionTotals.map((row) => [row.memberId, Number(row._sum.amount ?? 0)])
  );
  const savingsWithdrawalTotalByMemberId = new Map(
    savingsWithdrawalTotals.map((row) => [row.memberId, Number(row._sum.amount ?? 0)])
  );

  const memberOptions = members.map((member) => {
    const totalApprovedContributions = contributionTotalByMemberId.get(member.id) ?? 0;
    const totalSavingsWithdrawals = savingsWithdrawalTotalByMemberId.get(member.id) ?? 0;

    return {
      id: member.id,
      name: member.name,
      username: member.username,
      availableSavings: getAvailableSavingsAmount(totalApprovedContributions, totalSavingsWithdrawals)
    };
  });

  return { members: sortCommunityRows(memberOptions), rows };
}

export async function getEmergencyContext({
  memberId,
  canViewAll = false
}: {
  memberId?: string;
  canViewAll?: boolean;
} = {}) {
  const members = await prisma.user.findMany({
    where: { role: { in: COMMUNITY_ROLES } },
    select: { id: true, name: true, username: true }
  });

  const where = canViewAll
    ? (memberId ? { memberId } : undefined)
    : memberId
      ? { memberId }
      : { memberId: "__none__" };

  const rows = await prisma.emergencyRequest.findMany({
    where,
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

export async function getGoverningDocuments() {
  return prisma.governingDocument.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }]
  });
}

export async function getSettingsAccessOverview(): Promise<{
  roles: AccessRoleOverviewRow[];
  users: UserAccessAssignmentRow[];
}> {
  const [roles, users] = await Promise.all([getAccessRolesOverview(), getUserAccessAssignments()]);

  return {
    roles,
    users
  };
}

export async function getAccessRolesOverview(): Promise<AccessRoleOverviewRow[]> {
  const [roles, users] = await Promise.all([
    prisma.accessRole.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: {
              select: {
                key: true
              }
            }
          }
        }
      },
      orderBy: [
        { isSystem: "desc" },
        { name: "asc" }
      ]
    }),
    prisma.user.findMany({
      select: {
        role: true,
        accessRole: {
          select: {
            key: true
          }
        }
      }
    })
  ]);

  const userCountsByRoleKey = users.reduce<Record<string, number>>((counts, user) => {
    const roleKey = user.accessRole?.key || deriveLegacyAccessRoleKey(user.role);
    counts[roleKey] = (counts[roleKey] || 0) + 1;
    return counts;
  }, {});

  return roles.map((role) => ({
    id: role.id,
    key: role.key,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    permissionKeys: role.rolePermissions.map((entry) => entry.permission.key).sort((left, right) => left.localeCompare(right)),
    permissionCount: role.rolePermissions.length,
    userCount: userCountsByRoleKey[role.key] || 0
  }));
}

export async function getUserAccessAssignments(): Promise<UserAccessAssignmentRow[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      status: true,
      role: true,
      accessRoleId: true,
      accessRole: {
        select: {
          key: true,
          name: true
        }
      }
    },
    orderBy: [{ name: "asc" }]
  });

  return users.map((user) => {
    const effectiveAccessRoleKey = user.accessRole?.key || deriveLegacyAccessRoleKey(user.role);
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      status: user.status,
      legacyRole: user.role,
      assignedAccessRoleId: user.accessRoleId,
      assignedAccessRoleKey: user.accessRole?.key || null,
      assignedAccessRoleName: user.accessRole?.name || null,
      effectiveAccessRoleKey,
      effectiveAccessRoleName: user.accessRole?.name || getAccessRoleLabel(effectiveAccessRoleKey),
      accessSource: user.accessRole ? "assigned" : "legacy"
    };
  });
}
