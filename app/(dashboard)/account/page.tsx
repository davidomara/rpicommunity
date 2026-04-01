import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMemberAccountDirectory } from "@/lib/queries";
import { isAdmin } from "@/lib/rbac";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";
import { resetMemberPinAction, updateEmailAction, updateMemberEmailAction, updatePasswordAction } from "./actions";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) return null;
  const admin = isAdmin(session.user.role);
  const members = admin ? await getMemberAccountDirectory() : [];
  const defaultMember = members[0];
  const selectClassName = "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Personal Settings</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Account Settings</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Update Email</CardTitle></CardHeader>
          <CardContent>
            <form action={updateEmailAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" defaultValue={session.user.email || ""} required />
              </div>
              <SubmitButton label="Save Email" pendingLabel="Saving..." />
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
          <CardContent>
            <form action={updatePasswordAction} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="currentPassword">Current Password</Label><Input id="currentPassword" name="currentPassword" type="password" required /></div>
              <div className="space-y-2"><Label htmlFor="newPassword">New Password</Label><Input id="newPassword" name="newPassword" type="password" required /></div>
              <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" name="confirmPassword" type="password" required /></div>
              <SubmitButton label="Change Password" pendingLabel="Updating..." />
            </form>
          </CardContent>
        </Card>
      </div>
      {admin ? (
        <Card>
          <CardHeader>
            <CardTitle>Member Access Management</CardTitle>
          </CardHeader>
          <CardContent>
            {members.length ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <form action={updateMemberEmailAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="memberEmailMemberId">Member</Label>
                    <select id="memberEmailMemberId" name="memberId" defaultValue={defaultMember?.id} className={selectClassName} required>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memberEmail">New Member Email</Label>
                    <Input id="memberEmail" name="email" type="email" placeholder="Enter the updated email address" required />
                  </div>
                  <p className="text-xs text-slate-500">Select the member, then enter the replacement email address to save.</p>
                  <SubmitButton label="Update Member Email" pendingLabel="Saving..." />
                </form>
                <form action={resetMemberPinAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="memberPinMemberId">Member</Label>
                    <select id="memberPinMemberId" name="memberId" defaultValue={defaultMember?.id} className={selectClassName} required>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPin">Temporary PIN</Label>
                    <Input id="newPin" name="newPin" type="password" defaultValue="Member@123" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPin">Confirm Temporary PIN</Label>
                    <Input id="confirmPin" name="confirmPin" type="password" defaultValue="Member@123" required />
                  </div>
                  <p className="text-xs text-slate-500">Best option: use a temporary PIN, then share it directly with the member and have them change it after login.</p>
                  <SubmitButton label="Reset Member PIN" pendingLabel="Resetting..." />
                </form>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No member accounts exist yet. Add a member from the Members page first.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
