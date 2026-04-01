import { getDashboardData } from "@/lib/queries";
import { formatMoney } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { SummaryChart } from "@/components/dashboard/summary-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const chartData = data.members.map((member) => ({
    name: member.name,
    contributions: member.totalContributions,
    missing: member.missing,
    withdrawals: member.totalWithdrawals
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">RPIC Community Overview</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">Monitor contributions, withdrawals, community member status, and pending emergency assistance requests.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Contributions" value={formatMoney(data.summary.totalContributions)} note="All-time community contributions" />
        <StatCard title="Total Withdrawals" value={formatMoney(data.summary.totalWithdrawals)} note="All-time approved withdrawals" />
        <StatCard title="Current Balance" value={formatMoney(data.summary.balance)} note="Contributions minus withdrawals" />
        <StatCard title="Pending Emergency Requests" value={String(data.summary.pendingEmergencyRequests)} note="Awaiting admin action" />
        <StatCard title="Active Members" value={String(data.summary.active)} note={`Out of ${data.summary.members} members`} />
        <StatCard title="Warning Status" value={String(data.summary.warning)} note="Members needing follow-up" />
        <StatCard title="Closed Members" value={String(data.summary.closed)} note="No longer active" />
      </section>
      <SummaryChart data={chartData} />
      <Card>
        <CardHeader><CardTitle>Pending Emergency Requests</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="data-table min-w-full">
            <thead>
              <tr>
                <th>Member</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Request Date</th>
              </tr>
            </thead>
            <tbody>
              {data.pendingRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.member.name}</td>
                  <td>{formatMoney(Number(request.amount))}</td>
                  <td>{request.reason}</td>
                  <td><Badge value={request.status} /></td>
                  <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
