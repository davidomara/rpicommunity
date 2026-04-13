import { getDashboardData } from "@/lib/queries";
import { formatMoney } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { SummaryChart } from "@/components/dashboard/summary-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataScroll } from "@/components/ui/data-scroll";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const chartData = data.members.map((member) => ({
    name: member.name,
    contributions: member.totalContributions,
    missing: member.missing,
    withdrawals: member.totalWithdrawals,
    savings: member.savings
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">RPIC Community Overview</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Monitor required monthly contributions, member savings, withdrawals, status, and pending emergency assistance requests.</p>
      </div>
      <Card className="overflow-hidden">
        <CardContent className="p-3 sm:p-5">
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Current Balance" value={formatMoney(data.summary.balance)} note="Contributions minus withdrawals" tone="balance" />
            <StatCard title="Total Contributions" value={formatMoney(data.summary.totalContributions)} note="All-time community contributions" tone="contributions" />
            <StatCard title="Total Withdrawals" value={formatMoney(data.summary.totalWithdrawals)} note="All-time approved withdrawals" tone="withdrawals" />
            <StatCard title="Arrears" value={formatMoney(data.summary.totalArrears)} note="Outstanding member contribution gap" tone="arrears" />
            <StatCard title="Active Members" value={String(data.summary.active)} note={`Out of ${data.summary.members} members`} tone="active" />
            <StatCard title="Warning Status" value={String(data.summary.warning)} note="Members needing follow-up" tone="warning" />
            <StatCard title="Savings" value={formatMoney(data.summary.totalSavings)} note="Total amount contributed above the required monthly 10,000" tone="savings" />
            <StatCard title="Pending Emergency Requests" value={String(data.summary.pendingEmergencyRequests)} note="Awaiting approval workflow" tone="emergency" />
          </section>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Pending Emergency Requests</CardTitle></CardHeader>
        <CardContent>
          <p className="scroll-hint">Scroll sideways to view the full request table.</p>
          <DataScroll>
            <table className="data-table min-w-[720px]">
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
                    <td className="min-w-[160px]">{request.member.name}</td>
                    <td className="whitespace-nowrap">{formatMoney(Number(request.amount))}</td>
                    <td className="min-w-[220px]">{request.reason}</td>
                    <td className="whitespace-nowrap"><Badge value={request.status} /></td>
                    <td className="whitespace-nowrap">{new Date(request.requestDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataScroll>
        </CardContent>
      </Card>
      <SummaryChart data={chartData} />
    </div>
  );
}
