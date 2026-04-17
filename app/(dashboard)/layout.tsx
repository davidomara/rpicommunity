import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import type { Role } from "@/lib/domain-types";
import { getNotificationCount } from "@/lib/queries";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const notificationCount = await getNotificationCount(session.user.role, session.user.id);

  return (
    <>
      <AppShell role={session.user.role as Role} name={session.user.name || session.user.username || "Member"} notificationCount={notificationCount}>
        {children}
      </AppShell>
    </>
  );
}
