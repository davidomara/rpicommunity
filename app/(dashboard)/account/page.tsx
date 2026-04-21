import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCommunitySettings } from "@/lib/community-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMemberAccountDirectory } from "@/lib/queries";
import { getUserAuthorization, hasPermission } from "@/lib/rbac";
import {
  ChangePasswordForm,
  MemberStatusAutomationForm,
  ResetMemberPinForm,
  UpdateEmailForm,
  UpdateMemberEmailForm
} from "@/components/account/account-forms";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const authorization = await getUserAuthorization(session.user.id);
  if (!authorization || !hasPermission(authorization, "account.view")) redirect("/dashboard");
  const canManageUsers = hasPermission(authorization, "users.manage");
  const canManageSettings = hasPermission(authorization, "settings.manage");
  const members: Array<{ id: string; name: string; username: string }> = canManageUsers
    ? await getMemberAccountDirectory()
    : [];
  const statusSettings = canManageSettings ? await getCommunitySettings() : null;
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
            <UpdateEmailForm defaultEmail={session.user.email || ""} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
      {canManageUsers || canManageSettings ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          {canManageUsers ? (
            <Card>
              <CardHeader>
                <CardTitle>Member Access Management</CardTitle>
              </CardHeader>
              <CardContent>
                {members.length ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <UpdateMemberEmailForm members={members} selectClassName={selectClassName} />
                    <ResetMemberPinForm members={members} selectClassName={selectClassName} />
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No member accounts exist yet. Add a member from the Members page first.</p>
                )}
              </CardContent>
            </Card>
          ) : null}
          {canManageSettings ? (
            <Card>
              <CardHeader>
                <CardTitle>Member Status Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <MemberStatusAutomationForm
                  warningAfterMonths={statusSettings?.warningAfterMonths ?? 3}
                  closeAfterMonths={statusSettings?.closeAfterMonths ?? 6}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
