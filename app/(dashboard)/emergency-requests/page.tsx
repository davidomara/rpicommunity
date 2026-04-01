import { auth } from "@/auth";
import { isAdmin } from "@/lib/rbac";
import { getEmergencyContext } from "@/lib/queries";
import { EmergencyDecisionActions } from "@/components/forms/emergency-decision-actions";
import { EmergencyRequestPanel } from "@/components/forms/emergency-request-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/lib/utils";

export default async function EmergencyRequestsPage() {
  const session = await auth();
  if (!session?.user) return null;
  const admin = isAdmin(session.user.role);
  const { members, rows } = await getEmergencyContext(admin ? undefined : session.user.id, admin);

  return (
    <div className="space-y-6">
      <EmergencyRequestPanel memberId={session.user.id} isAdmin={admin} members={members.map((m) => ({ id: m.id, name: m.name || m.username }))} />
      <Card>
        <CardHeader><CardTitle>Recent Requests</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="data-table min-w-full">
            <thead><tr><th>Member</th><th>Amount</th><th>Reason</th><th>Status</th><th>Request Date</th>{admin ? <th>Actions</th> : null}</tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.member.name}</td>
                  <td>{formatMoney(Number(row.amount))}</td>
                  <td>{row.reason}</td>
                  <td><Badge value={row.status} /></td>
                  <td>{formatDate(row.requestDate)}</td>
                  {admin ? (
                    <td>
                      {row.status === "PENDING" ? (
                        <EmergencyDecisionActions
                          requestId={row.id}
                          memberName={row.member.name || row.member.username}
                          amount={Number(row.amount)}
                        />
                      ) : (
                        <span className="text-xs font-medium text-slate-400">No actions</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
