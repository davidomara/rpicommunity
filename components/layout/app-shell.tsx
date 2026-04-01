import { Building2, LogOut } from "lucide-react";
import { signOut } from "@/auth";
import { APP_NAME, APP_SUBTITLE } from "@/lib/settings";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { DesktopDashboardNav, MobileDashboardNav } from "@/components/layout/dashboard-nav";

export function AppShell({
  role,
  name,
  children
}: {
  role: Role;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="page-shell">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-950 px-5 py-6 text-slate-100 lg:block">
        <div className="mb-8 flex items-center gap-3 rounded-xl bg-white/5 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-200">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-cyan-100">{APP_NAME}</div>
            <div className="text-xs text-slate-400">{APP_SUBTITLE}</div>
          </div>
        </div>
        <DesktopDashboardNav role={role} />
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <MobileDashboardNav
                role={role}
                name={name}
                actions={
                  <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
                    <Button variant="outline" className="w-full gap-2 justify-center">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </form>
                }
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Welcome back, {name}</p>
                <p className="text-xs text-slate-500">Research Planning and Innovation Center Community</p>
              </div>
            </div>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }} className="hidden sm:block">
              <Button variant="outline" className="gap-2"><LogOut className="h-4 w-4" />Logout</Button>
            </form>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
