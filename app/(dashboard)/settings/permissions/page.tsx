import { redirect } from "next/navigation";
import { PermissionsSettingsClient } from "@/components/settings/rbac-settings-client";
import { getAccessRolesOverview } from "@/lib/queries";
import { canAccessSettings, getCurrentUserAuthorization, getPermissionDefinitions, hasPermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPermissionsPage() {
  const authorization = await getCurrentUserAuthorization();
  if (!authorization || !canAccessSettings(authorization)) redirect("/dashboard");

  const roles = await getAccessRolesOverview();

  return (
    <PermissionsSettingsClient
      permissions={getPermissionDefinitions().map((permission) => ({
        key: permission.key,
        module: permission.module,
        name: permission.name,
        description: permission.description
      }))}
      roles={roles}
      canManageRoles={hasPermission(authorization, "roles.manage")}
    />
  );
}
