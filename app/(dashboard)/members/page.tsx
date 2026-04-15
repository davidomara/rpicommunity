import { auth } from "@/auth";
import { appRoute } from "@/lib/app-path";
import { redirect } from "next/navigation";
import { AddMemberPanel } from "@/components/members/add-member-panel";
import { getArrearsAmount, getExpectedContributionAmount, getSavingsAmount } from "@/lib/member-status";
import { getMembersDirectory } from "@/lib/queries";
import { canManageMembers } from "@/lib/rbac";
import { MembersTable } from "@/components/tables/members-table";
import { formatMoney } from "@/lib/utils";

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user) redirect(appRoute("/login"));

  const admin = canManageMembers(session.user.role);
  const members = await getMembersDirectory();
  const expectedPerMemberToDate = getExpectedContributionAmount();
  const rows = members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status,
    contributions: member.contributions.reduce((sum, row) => sum + Number(row.amount), 0),
    withdrawals: member.withdrawals.reduce((sum, row) => sum + Number(row.amount), 0),
    savings: getSavingsAmount(member.contributions.reduce((sum, row) => sum + Number(row.amount), 0)),
    arrears: getArrearsAmount(member.contributions.reduce((sum, row) => sum + Number(row.amount), 0)),
    pendingStatusChange: member.targetedStatusChanges[0]
      ? {
          id: member.targetedStatusChanges[0].id,
          currentStatus: member.targetedStatusChanges[0].currentStatus,
          requestedStatus: member.targetedStatusChanges[0].requestedStatus,
          adminApproved: Boolean(member.targetedStatusChanges[0].adminApprovedAt),
          treasurerApproved: Boolean(member.targetedStatusChanges[0].treasurerApprovedAt)
        }
      : null
  }));

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
            <span className="font-medium text-slate-600"> (since May 2026): </span>
            <span className="font-semibold text-slate-950">{formatMoney(expectedPerMemberToDate)}</span>
          </p>
        </div>
      )}
      <MembersTable rows={rows} role={session.user.role} />
    </div>
  );
}
