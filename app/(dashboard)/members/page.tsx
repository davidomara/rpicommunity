import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AddMemberPanel } from "@/components/members/add-member-panel";
import type { Role } from "@/lib/domain-types";
import { getArrearsAmount, getExpectedContributionAmount, getSavingsAmount } from "@/lib/member-status";
import { getMembersDirectory } from "@/lib/queries";
import { canManageMembers } from "@/lib/rbac";
import { MembersTable } from "@/components/tables/members-table";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const admin = canManageMembers(session.user.role);
  const members = await getMembersDirectory();
  const expectedPerMemberToDate = getExpectedContributionAmount();
  const rows = members.map((member) => {
    const totalContributions = member.contributions.reduce((sum, row) => sum + Number(row.amount), 0);
    const totalWithdrawals = member.withdrawals.reduce((sum, row) => sum + Number(row.amount), 0);
    const pendingChange = (member.memberStatusChanges as Array<{
      id: string;
      currentStatus: string;
      requestedStatus: string;
      adminApprovedAt: Date | null;
      treasurerApprovedAt: Date | null;
    }>)[0];

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role as Role,
      status: member.status,
      contributions: totalContributions,
      withdrawals: totalWithdrawals,
      savings: getSavingsAmount(totalContributions),
      arrears: getArrearsAmount(totalContributions),
      pendingStatusChange: pendingChange
        ? {
            id: pendingChange.id,
            currentStatus: pendingChange.currentStatus,
            requestedStatus: pendingChange.requestedStatus,
            adminApproved: Boolean(pendingChange.adminApprovedAt),
            treasurerApproved: Boolean(pendingChange.treasurerApprovedAt)
          }
        : null
    };
  });

  return (
    <div className="space-y-6">
      {admin ? (
        <AddMemberPanel expectedPerMemberToDate={expectedPerMemberToDate} />
      ) : (
        <div>
          <p className="text-sm font-medium text-cyan-700">Community Directory</p>
          <div className="mt-1 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Members</h1>
            <span className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-800">
              April 2026
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            View member standings. The required emergency contribution is
            <span className="font-medium text-slate-600"> 10,000 per month, </span>
            and any extra approved contribution counts as savings. Expected per member to date
            <span className="font-medium text-slate-600"> (since April 2026): </span>
            <span className="font-semibold text-slate-950">{formatMoney(expectedPerMemberToDate)}</span>
          </p>
        </div>
      )}
      <MembersTable rows={rows} role={session.user.role as Role} />
    </div>
  );
}
