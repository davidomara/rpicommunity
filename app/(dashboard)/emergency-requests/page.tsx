import { auth } from "@/auth";
import { isAdmin } from "@/lib/rbac";
import { getEmergencyContext } from "@/lib/queries";
import { EmergencyRequestForm } from "@/components/forms/emergency-request-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/lib/utils";
import { createEmergencyRequestAction, decideEmergencyRequestAction } from "./actions";

export default async function EmergencyRequestsPage() {
  const session = await auth();
  if (!session?.user) return null;
  const admin = isAdmin(session.user.role);
  const { members, rows } = await getEmergencyContext(admin ? undefined : session.user.id, admin);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Emergency Support</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Emergency Requests</h1>
        <p className="mt-2 text-sm text-slate-500">Members can request emergency assistance. Admins can review and decide requests.</p>
      </div>
      <EmergencyRequestForm action={createEmergencyRequestAction} memberId={session.user.id} isAdmin={admin} members={members.map((m) => ({ id: m.id, name: m.name || m.username }))} />
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
                      <div className="flex gap-2">
                        <form action={decideEmergencyRequestAction}><input type="hidden" name="requestId" value={row.id} /><input type="hidden" name="status" value="APPROVED" /><Button size="sm">Approve</Button></form>
                        <form action={decideEmergencyRequestAction}><input type="hidden" name="requestId" value={row.id} /><input type="hidden" name="status" value="REJECTED" /><Button size="sm" variant="destructive">Reject</Button></form>
                      </div>
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
