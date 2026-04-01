import { auth } from "@/auth";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMembersDirectory } from "@/lib/queries";
import { isAdmin } from "@/lib/rbac";
import { MembersTable } from "@/components/tables/members-table";
import { createMemberAction } from "./actions";

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user) return null;

  const admin = isAdmin(session.user.role);
  const members = await getMembersDirectory();
  const rows = members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    status: member.status,
    contributions: member.contributions.reduce((sum, row) => sum + Number(row.amount), 0),
    withdrawals: member.withdrawals.reduce((sum, row) => sum + Number(row.amount), 0),
    pending: member.emergencyRequests.length
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-cyan-700">Community Directory</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Members</h1>
          <p className="mt-2 text-sm text-slate-500">View contribution and withdrawal standing for each RPIC Community member.</p>
        </div>
        {admin ? (
          <Button asChild className="sm:mt-1">
            <a href="#add-member">Add New Member</a>
          </Button>
        ) : null}
      </div>
      {admin ? (
        <Card id="add-member">
          <CardHeader>
            <CardTitle>Add Member To Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createMemberAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Member Status</Label>
                <select id="status" name="status" defaultValue="ACTIVE" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required>
                  <option value="ACTIVE">Active</option>
                  <option value="WARNING">Warning</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temporaryPin">Temporary PIN</Label>
                <Input id="temporaryPin" name="temporaryPin" type="password" defaultValue="Member@123" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmTemporaryPin">Confirm Temporary PIN</Label>
                <Input id="confirmTemporaryPin" name="confirmTemporaryPin" type="password" defaultValue="Member@123" required />
              </div>
              <div className="md:col-span-2 xl:col-span-3">
                <p className="mb-4 text-xs text-slate-500">Best option: create the member with a temporary PIN, then ask them to change it from Account Settings after first login.</p>
                <SubmitButton label="Create Member" pendingLabel="Creating..." />
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      <MembersTable rows={rows} />
    </div>
  );
}
