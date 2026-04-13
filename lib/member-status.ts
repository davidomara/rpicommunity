import { MemberStatus } from "@prisma/client";
import { COMMUNITY_CONTRIBUTION_START, EXPECTED_MONTHLY_CONTRIBUTION } from "@/lib/settings";

export type MemberStatusThresholds = {
  warningAfterMonths: number;
  closeAfterMonths: number;
};

export const DEFAULT_MEMBER_STATUS_THRESHOLDS: MemberStatusThresholds = {
  warningAfterMonths: 3,
  closeAfterMonths: 6
};

export function getExpectedContributionMonths(now = new Date()) {
  const startYear = COMMUNITY_CONTRIBUTION_START.getUTCFullYear();
  const startMonth = COMMUNITY_CONTRIBUTION_START.getUTCMonth();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();

  return Math.max(0, (currentYear - startYear) * 12 + (currentMonth - startMonth));
}

export function getExpectedContributionAmount(now = new Date()) {
  return getExpectedContributionMonths(now) * EXPECTED_MONTHLY_CONTRIBUTION;
}

export function getArrearsAmount(totalContributions: number, now = new Date()) {
  return Math.max(0, getExpectedContributionAmount(now) - totalContributions);
}

export function getSavingsAmount(totalContributions: number, now = new Date()) {
  return Math.max(0, totalContributions - getExpectedContributionAmount(now));
}

export function getArrearsMonthsFromAmount(arrearsAmount: number) {
  if (EXPECTED_MONTHLY_CONTRIBUTION <= 0) return 0;
  return Math.floor(arrearsAmount / EXPECTED_MONTHLY_CONTRIBUTION);
}

export function resolveMemberStatus(
  totalContributions: number,
  thresholds: MemberStatusThresholds,
  now = new Date()
) {
  const arrearsAmount = getArrearsAmount(totalContributions, now);
  const arrearsMonths = getArrearsMonthsFromAmount(arrearsAmount);

  let status: MemberStatus = MemberStatus.ACTIVE;
  if (arrearsMonths >= thresholds.closeAfterMonths) {
    status = MemberStatus.CLOSED;
  } else if (arrearsMonths >= thresholds.warningAfterMonths) {
    status = MemberStatus.WARNING;
  }

  return {
    status,
    arrearsAmount,
    arrearsMonths
  };
}
