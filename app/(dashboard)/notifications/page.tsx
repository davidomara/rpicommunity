import { auth } from "@/auth";
import { withBasePath } from "@/lib/app-path";
import { CONTRIBUTION_APPROVAL_STATUS, EMERGENCY_STATUS, type EmergencyStatus } from "@/lib/domain-types";
import { redirect } from "next/navigation";
import { getContributionNotifications, getEmergencyContext } from "@/lib/queries";
import { canApproveEmergencyDisbursements, canReviewContributionNotifications } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataScroll } from "@/components/ui/data-scroll";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/utils";
import { approveContributionNotificationAction, rejectContributionNotificationAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { EmergencyDecisionActions } from "@/components/forms/emergency-decision-actions";

function getEmergencyApprovalLabel(
  approvedAt: Date | string | null,
  rowStatus: EmergencyStatus,
  pendingLabel: string
) {
  if (approvedAt) {
    return `Approved ${formatDate(approvedAt)}`;
  }

  if (rowStatus === EMERGENCY_STATUS.REJECTED) {
    return "Not approved";
  }

  return pendingLabel;
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect(withBasePath("/login"));

  const { rows, adminReview } = await getContributionNotifications(session.user.role);
  const contributionCanAct = canReviewContributionNotifications(session.user.role);
  const emergencyCanAct = canApproveEmergencyDisbursements(session.user.role);
  const { rows: emergencyRows } = await getEmergencyContext(undefined, true);
  const pendingContributionRows = rows.filter((row) => row.approvalStatus === CONTRIBUTION_APPROVAL_STATUS.PENDING);
  const pendingEmergencyRows = emergencyRows.filter((row) => row.status === EMERGENCY_STATUS.PENDING);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Workflow Inbox</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Notifications</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          {adminReview
            ? "Review shared contribution and emergency workflow activity across the community and act on items that are still pending."
            : "View the shared contribution and emergency workflow activity across the community."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contribution Notifications</CardTitle>
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
                  {contributionCanAct ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {pendingContributionRows.length ? pendingContributionRows.map((row) => (
                  <tr key={row.id}>
                    <td className="min-w-[180px]">{row.member.name || row.member.username}</td>
                    <td className="whitespace-nowrap">{formatMoney(Number(row.amount))}</td>
                    <td className="whitespace-nowrap">{formatDate(row.contributionDate)}</td>
                    <td className="whitespace-nowrap">{formatDate(row.createdAt)}</td>
                    <td className="whitespace-nowrap">{row.approvalStatus}</td>
                    <td className="whitespace-nowrap">
                      {row.approvedBy?.name || row.rejectedBy?.name || "-"}
                    </td>
                    {contributionCanAct ? (
                      <td className="whitespace-nowrap">
                        {row.approvalStatus === CONTRIBUTION_APPROVAL_STATUS.PENDING ? (
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
                        ) : "-"}
                      </td>
                    ) : null}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={contributionCanAct ? 7 : 6} className="text-sm text-slate-500">
                      No contribution notifications yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </DataScroll>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Request Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="scroll-hint">Scroll sideways to view the full emergency request table and actions.</p>
          <DataScroll className="mt-2">
            <table className="data-table min-w-[1120px]">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Requested</th>
                  <th>Approved</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Admin Approval</th>
                  <th>Treasurer Approval</th>
                  <th>Request Date</th>
                  {emergencyCanAct ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {pendingEmergencyRows.length ? pendingEmergencyRows.map((row) => (
                  <tr key={row.id}>
                    <td className="min-w-[180px]">{row.member.name}</td>
                    <td className="whitespace-nowrap">{formatMoney(Number(row.amount))}</td>
                    <td className="whitespace-nowrap">
                      {row.approvedAmount
                        ? formatMoney(Number(row.approvedAmount))
                        : row.status === "PENDING"
                          ? "Pending"
                          : "-"}
                    </td>
                    <td className="min-w-[240px]">{row.reason}</td>
                    <td className="whitespace-nowrap"><Badge value={row.status} /></td>
                    <td className="whitespace-nowrap">{getEmergencyApprovalLabel(row.adminApprovedAt, row.status, "Awaiting Admin")}</td>
                    <td className="whitespace-nowrap">{getEmergencyApprovalLabel(row.treasurerApprovedAt, row.status, "Awaiting Treasurer")}</td>
                    <td className="whitespace-nowrap">{formatDate(row.requestDate)}</td>
                    {emergencyCanAct ? (
                      <td className="whitespace-nowrap">
                        {row.status === EMERGENCY_STATUS.PENDING ? (
                          <EmergencyDecisionActions
                            requestId={row.id}
                            memberName={row.member.name || row.member.username}
                            amount={Number(row.amount)}
                            approvedAmount={row.approvedAmount ? Number(row.approvedAmount) : null}
                            actorRole={session.user.role}
                            adminApproved={Boolean(row.adminApprovedAt)}
                            treasurerApproved={Boolean(row.treasurerApprovedAt)}
                          />
                        ) : "-"}
                      </td>
                    ) : null}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={emergencyCanAct ? 9 : 8} className="text-sm text-slate-500">
                      No emergency request notifications yet.
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
