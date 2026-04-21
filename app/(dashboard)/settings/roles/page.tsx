import { redirect } from "next/navigation";
import { RolesSettingsClient } from "@/components/settings/rbac-settings-client";
import { getSettingsAccessOverview } from "@/lib/queries";
import { canAccessSettings, getCurrentUserAuthorization, hasPermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsRolesPage() {
  const authorization = await getCurrentUserAuthorization();
  if (!authorization || !canAccessSettings(authorization)) redirect("/dashboard");

  const { roles, users } = await getSettingsAccessOverview();

  return (
    <RolesSettingsClient
      roles={roles}
      users={users}
      canManageUsers={hasPermission(authorization, "users.manage")}
    />
  );
}
