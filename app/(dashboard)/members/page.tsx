import { auth } from "@/auth";
import { AddMemberPanel } from "@/components/members/add-member-panel";
import { getMembersDirectory } from "@/lib/queries";
import { canManageMembers } from "@/lib/rbac";
import { MembersTable } from "@/components/tables/members-table";
import { COMMUNITY_CONTRIBUTION_START, EXPECTED_MONTHLY_CONTRIBUTION } from "@/lib/settings";

function getExpectedContributionMonths(now = new Date()) {
  const startYear = COMMUNITY_CONTRIBUTION_START.getUTCFullYear();
  const startMonth = COMMUNITY_CONTRIBUTION_START.getUTCMonth();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();

  return Math.max(0, (currentYear - startYear) * 12 + (currentMonth - startMonth));
}

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user) return null;

  const admin = canManageMembers(session.user.role);
  const members = await getMembersDirectory();
  const expectedMonths = getExpectedContributionMonths();
  const expectedContribution = expectedMonths * EXPECTED_MONTHLY_CONTRIBUTION;
  const rows = members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    status: member.status,
    contributions: member.contributions.reduce((sum, row) => sum + Number(row.amount), 0),
    withdrawals: member.withdrawals.reduce((sum, row) => sum + Number(row.amount), 0),
    pending: member.emergencyRequests.length,
    arrears: Math.max(0, expectedContribution - member.contributions.reduce((sum, row) => sum + Number(row.amount), 0))
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
      <MembersTable rows={rows} />
    </div>
  );
}
