import { auth } from "@/auth";
import { getCommunitySettings } from "@/lib/community-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMemberAccountDirectory } from "@/lib/queries";
import { canManageMembers } from "@/lib/rbac";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { resetMemberPinAction, updateEmailAction, updateMemberEmailAction, updateMemberStatusThresholdsAction, updatePasswordAction } from "./actions";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) return null;
  const admin = canManageMembers(session.user.role);
  const [members, statusSettings] = await Promise.all([
    admin ? getMemberAccountDirectory() : [],
    admin ? getCommunitySettings() : null
  ]);
  const selectClassName = "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Personal Settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Account Settings</h1>
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
              <SubmitButton label="Save Email" pendingLabel="Saving..." className="w-full sm:w-auto" />
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
              <div className="flex flex-col gap-3 sm:flex-row">
                <SubmitButton label="Change Password" pendingLabel="Updating..." className="w-full sm:w-auto" />
                <Button type="reset" variant="outline" className="w-full border-amber-200 bg-amber-50 font-medium text-amber-800 hover:bg-amber-100 sm:w-auto">Clear</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      {admin ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
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
                      <select id="memberEmailMemberId" name="memberId" defaultValue="" className={selectClassName} required>
                        <option value="" disabled>Select member account</option>
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
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <SubmitButton label="Update Member Email" pendingLabel="Saving..." className="w-full sm:w-auto" />
                      <Button type="reset" variant="outline" className="w-full border-amber-200 bg-amber-50 font-medium text-amber-800 hover:bg-amber-100 sm:w-auto">Clear</Button>
                    </div>
                  </form>
                  <form action={resetMemberPinAction} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="memberPinMemberId">Member</Label>
                      <select id="memberPinMemberId" name="memberId" defaultValue="" className={selectClassName} required>
                        <option value="" disabled>Select member account</option>
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
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <SubmitButton label="Reset Member PIN" pendingLabel="Resetting..." className="w-full sm:w-auto" />
                      <Button type="reset" variant="outline" className="w-full border-amber-200 bg-amber-50 font-medium text-amber-800 hover:bg-amber-100 sm:w-auto">Clear</Button>
                    </div>
                  </form>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No member accounts exist yet. Add a member from the Members page first.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Member Status Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateMemberStatusThresholdsAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="warningAfterMonths">Warning After</Label>
                  <Input id="warningAfterMonths" name="warningAfterMonths" type="number" min="1" defaultValue={statusSettings?.warningAfterMonths ?? 3} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeAfterMonths">Close After</Label>
                  <Input id="closeAfterMonths" name="closeAfterMonths" type="number" min="1" defaultValue={statusSettings?.closeAfterMonths ?? 6} required />
                </div>
                <p className="text-xs leading-5 text-slate-500">
                  Member status is derived automatically from full months in arrears. A member stays active below the warning
                  threshold, moves to warning at the configured month gap, and closes automatically once the higher threshold is reached.
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
                  Current rule: warning at <strong>{statusSettings?.warningAfterMonths ?? 3}</strong> months in arrears, close at{" "}
                  <strong>{statusSettings?.closeAfterMonths ?? 6}</strong> months in arrears.
                </div>
                <SubmitButton label="Save Status Rules" pendingLabel="Saving..." className="w-full sm:w-auto" />
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
