"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileText,
  HandCoins,
  Home,
  Landmark,
  Menu,
  ScrollText,
  Settings,
  ShieldAlert,
  Users,
  X
} from "lucide-react";
import { APP_NAME, APP_SUBTITLE } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavRole = "ADMIN" | "MEMBER";

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

function getItems(role: NavRole) {
  return role === "ADMIN" ? [...baseItems.slice(0, 2), ...financeItems, ...baseItems.slice(2)] : baseItems;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  role,
  onNavigate
}: {
  role: NavRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = getItems(role);

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
              active
                ? "bg-cyan-500/15 text-white shadow-sm ring-1 ring-inset ring-cyan-300/20"
                : "text-slate-200 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className={cn("h-4 w-4", active ? "text-cyan-200" : "text-slate-400")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DesktopDashboardNav({ role }: { role: NavRole }) {
  return <NavLinks role={role} />;
}

export function MobileDashboardNav({
  role,
  name,
  actions
}: {
  role: NavRole;
  name: string;
  actions: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="gap-2 lg:hidden" onClick={() => setOpen(true)}>
        <Menu className="h-4 w-4" />
        Menu
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/45 transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-80 max-w-[88vw] flex-col bg-slate-950 px-5 py-6 text-slate-100 shadow-2xl transition-transform duration-200 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-200">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-cyan-100">{APP_NAME}</div>
              <div className="text-xs text-slate-400">{APP_SUBTITLE}</div>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" className="text-slate-200 hover:bg-white/5" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Signed in</p>
          <p className="mt-1 text-sm font-medium text-white">{name}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavLinks role={role} onNavigate={() => setOpen(false)} />
        </div>

        <div className="mt-6 border-t border-white/10 pt-4" onClick={() => setOpen(false)}>
          {actions}
        </div>
      </aside>
    </>
  );
}
