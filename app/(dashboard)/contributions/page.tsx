import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canManageFinance } from "@/lib/rbac";
import { getContributionContext } from "@/lib/queries";
import { ContributionForm } from "@/components/forms/contribution-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, formatDate } from "@/lib/utils";
import { createContributionAction } from "./actions";

export default async function ContributionsPage({ searchParams }: { searchParams: { memberId?: string } }) {
  const session = await auth();
  if (!session?.user || !canManageFinance(session.user.role)) redirect("/dashboard");

  const { members, selectedId, rows } = await getContributionContext(searchParams.memberId);
  const selectedMember = members.find((member) => member.id === selectedId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Financial Administration</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Contributions</h1>
      </div>
      <ContributionForm
        members={members.map((m) => ({ id: m.id, name: m.name || m.username, username: m.username }))}
        action={createContributionAction}
        selectedMemberId={selectedId}
      />
      <Card>
        <CardHeader>
          <CardTitle>Recent Contributions</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            {selectedMember
              ? `Displaying contributions for ${selectedMember.name || selectedMember.username}.`
              : "No member selected."}
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="data-table min-w-full">
            <thead><tr><th>ID</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {rows.length ? rows.map((row) => <tr key={row.id}><td>{row.id.slice(-8)}</td><td>{formatMoney(Number(row.amount))}</td><td>{formatDate(row.contributionDate)}</td></tr>) : (
                <tr>
                  <td colSpan={3} className="text-sm text-slate-500">No contributions found for the selected member.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
