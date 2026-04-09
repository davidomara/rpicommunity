import { auth } from "@/auth";
import { AddMemberPanel } from "@/components/members/add-member-panel";
import { getArrearsAmount } from "@/lib/member-status";
import { getMembersDirectory } from "@/lib/queries";
import { canManageMembers } from "@/lib/rbac";
import { MembersTable } from "@/components/tables/members-table";

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user) return null;

  const admin = canManageMembers(session.user.role);
  const members = await getMembersDirectory();
  const rows = members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    status: member.status,
    contributions: member.contributions.reduce((sum, row) => sum + Number(row.amount), 0),
    withdrawals: member.withdrawals.reduce((sum, row) => sum + Number(row.amount), 0),
    pending: member.emergencyRequests.length,
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
        <AddMemberPanel />
      ) : (
        <div>
          <p className="text-sm font-medium text-cyan-700">Community Directory</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Members</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">View contribution and withdrawal standing for each RPIC Community member.</p>
        </div>
      )}
      <MembersTable rows={rows} role={session.user.role} />
    </div>
  );
}
