import Image from "next/image";
import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { signOut } from "@/auth";
import { APP_NAME, APP_SUBTITLE } from "@/lib/settings";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { DesktopDashboardNav, MobileDashboardNav } from "@/components/layout/dashboard-nav";
import { BackToTopButton } from "@/components/ui/back-to-top-button";

export function AppShell({
  role,
  name,
  notificationCount,
  children
}: {
  role: Role;
  name: string;
  notificationCount: number;
  children: React.ReactNode;
}) {
  const logoutButtonClassName = "gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800";
  const notificationLinkClassName = "relative h-10 w-10 rounded-xl border border-slate-200 bg-white/85 text-slate-700 hover:bg-white hover:text-slate-950";

  return (
    <div className="page-shell h-screen overflow-hidden">
      <aside className="hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-950 px-5 py-6 text-slate-100 lg:block">
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-white/8 bg-white/5 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center">
            <Image
              src="/branding/rpic-logo.svg"
              alt="RPIC logo"
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
            />
          </div>
          <div>
            <div className="text-sm font-medium text-cyan-100">{APP_NAME}</div>
            <div className="text-xs leading-4 whitespace-nowrap text-slate-400">{APP_SUBTITLE}</div>
          </div>
        </div>
        <DesktopDashboardNav role={role} notificationCount={notificationCount} />
      </aside>
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-[linear-gradient(180deg,rgba(238,244,251,0.99)_0%,rgba(224,234,245,0.99)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.68)] backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
            <div className="flex min-w-0 flex-1 items-start gap-1.5 sm:gap-3">
              <MobileDashboardNav
                role={role}
                name={name}
                notificationCount={notificationCount}
                actions={
                  <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
                    <Button variant="outline" className={`w-full justify-center ${logoutButtonClassName}`}>
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </form>
                }
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
                <p className="truncate text-[15px] font-medium leading-5 text-slate-900 sm:text-base">Welcome back, {name}</p>
                <p className="text-xs leading-4 text-slate-500 sm:hidden">RPIC</p>
                <p className="hidden line-clamp-2 text-xs leading-4 text-slate-500 sm:block sm:leading-5">Research Planning and Innovation Center Community</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
              <Button asChild variant="outline" className={notificationLinkClassName}>
                <Link href="/notifications" aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount})` : ""}`}>
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 ? (
                    <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-amber-400 px-1 py-0.5 text-[10px] font-bold leading-none text-slate-950">
                      {notificationCount}
                    </span>
                  ) : null}
                </Link>
              </Button>
              <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }} className="hidden sm:block">
                <Button variant="outline" className={logoutButtonClassName}><LogOut className="h-4 w-4" />Logout</Button>
              </form>
            </div>
          </div>
        </header>
        <main data-app-scroll-container="true" className="mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto px-2 py-5 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>
        <BackToTopButton />
      </div>
    </div>
  );
}
