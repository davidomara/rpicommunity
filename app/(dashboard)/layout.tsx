import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getNotificationCount } from "@/lib/queries";
import { getUserAuthorization } from "@/lib/rbac";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const authorization = await getUserAuthorization(session.user.id);
  if (!authorization) redirect("/login");
  const notificationCount = await getNotificationCount(authorization);

  return (
    <>
      <AppShell permissionKeys={authorization.permissionKeys} name={session.user.name || session.user.username || "Member"} notificationCount={notificationCount}>
        {children}
      </AppShell>
    </>
  );
}
