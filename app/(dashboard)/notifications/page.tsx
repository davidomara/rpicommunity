import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getContributionNotifications } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataScroll } from "@/components/ui/data-scroll";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/utils";
import { approveContributionNotificationAction, rejectContributionNotificationAction } from "./actions";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { rows, adminReview } = await getContributionNotifications(session.user.role, session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Workflow Inbox</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Notifications</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          {adminReview
            ? "Review member-submitted contribution records before they are added to the live finance totals."
            : "Track the status of your submitted contribution records."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{adminReview ? "Pending Contribution Approvals" : "Your Contribution Alerts"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="scroll-hint">Scroll sideways to view the full notifications table.</p>
          <DataScroll className="mt-2">
            <table className="data-table min-w-[980px]">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Contribution Date</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Reviewed By</th>
                  {adminReview ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {rows.length ? rows.map((row) => (
                  <tr key={row.id}>
                    <td className="min-w-[180px]">{row.member.name || row.member.username}</td>
                    <td className="whitespace-nowrap">{formatMoney(Number(row.amount))}</td>
                    <td className="whitespace-nowrap">{formatDate(row.contributionDate)}</td>
                    <td className="whitespace-nowrap">{formatDate(row.createdAt)}</td>
                    <td className="whitespace-nowrap">{row.approvalStatus}</td>
                    <td className="whitespace-nowrap">
                      {row.approvedBy?.name || row.rejectedBy?.name || "-"}
                    </td>
                    {adminReview ? (
                      <td className="whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          <form action={approveContributionNotificationAction}>
                            <input type="hidden" name="contributionId" value={row.id} />
                            <Button type="submit" size="sm">Approve</Button>
                          </form>
                          <form action={rejectContributionNotificationAction}>
                            <input type="hidden" name="contributionId" value={row.id} />
                            <Button type="submit" size="sm" variant="outline" className="border-amber-200 bg-amber-50 font-medium text-amber-800 hover:bg-amber-100">Reject</Button>
                          </form>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={adminReview ? 7 : 6} className="text-sm text-slate-500">
                      {adminReview ? "No pending contribution notifications." : "No contribution notifications yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </DataScroll>
        </CardContent>
      </Card>
    </div>
  );
}
