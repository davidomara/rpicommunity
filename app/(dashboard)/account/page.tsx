import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";
import { updateEmailAction, updatePasswordAction } from "./actions";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) return null;

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
    </div>
  );
}
