import Link from "next/link";
import { Home, Users, HandCoins, Landmark, ShieldAlert, FileText, Settings, Building2, ScrollText, LogOut } from "lucide-react";
import { signOut } from "@/auth";
import { APP_NAME, APP_SUBTITLE } from "@/lib/settings";
import { isAdmin } from "@/lib/rbac";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";

const baseItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/members", label: "Members", icon: Users },
  { href: "/emergency-requests", label: "Emergency Requests", icon: ShieldAlert },
  { href: "/bank-statements", label: "Bank Statements", icon: FileText },
  { href: "/constitution", label: "Constitution", icon: ScrollText },
  { href: "/account", label: "Account", icon: Settings }
];

const financeItems = [
  { href: "/contributions", label: "Contributions", icon: HandCoins },
  { href: "/withdrawals", label: "Withdrawals", icon: Landmark }
];

export function AppShell({
  role,
  name,
  children
}: {
  role: Role;
  name: string;
  children: React.ReactNode;
}) {
  const items = isAdmin(role) ? [...baseItems.slice(0, 2), ...financeItems, ...baseItems.slice(2)] : baseItems;

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
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-200 transition hover:bg-white/5 hover:text-white">
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-medium text-slate-900">Welcome back, {name}</p>
              <p className="text-xs text-slate-500">Research Planning and Innovation Center Community</p>
            </div>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
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
