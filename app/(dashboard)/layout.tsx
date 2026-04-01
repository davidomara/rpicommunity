import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { IdleSessionGuard } from "@/components/layout/idle-session-guard";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <>
      <IdleSessionGuard />
      <AppShell role={session.user.role} name={session.user.name || session.user.username || "Member"}>
        {children}
      </AppShell>
    </>
  );
}
