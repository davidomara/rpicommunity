"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import {
  FileText,
  Bell,
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
import { canManageFinance } from "@/lib/rbac";
import type { Role } from "@prisma/client";

type NavRole = Role;

const baseItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/members", label: "Members", icon: Users },
  { href: "/contributions", label: "Contributions", icon: HandCoins },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/emergency-requests", label: "Emergency Requests", icon: ShieldAlert },
  { href: "/bank-statements", label: "Bank Statements", icon: FileText },
  { href: "/constitution", label: "Constitution", icon: ScrollText },
  { href: "/account", label: "Account", icon: Settings }
];

const financeItems = [
  { href: "/withdrawals", label: "Withdrawals", icon: Landmark }
];

function getItems(role: NavRole) {
  return canManageFinance(role) ? [...baseItems.slice(0, 2), ...financeItems, ...baseItems.slice(2)] : baseItems;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  role,
  notificationCount,
  onNavigate
}: {
  role: NavRole;
  notificationCount: number;
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
            onClick={() => {
              const activeElement = document.activeElement;
              if (activeElement instanceof HTMLElement) activeElement.blur();
              onNavigate?.();
            }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
              active
                ? "bg-cyan-500/15 text-white shadow-sm ring-1 ring-inset ring-cyan-300/20"
                : "text-slate-200 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className={cn("h-4 w-4", active ? "text-cyan-200" : "text-slate-400")} />
            <span>{item.label}</span>
            {item.href === "/notifications" && notificationCount > 0 ? (
              <span
                className={cn(
                  "ml-auto inline-flex min-w-[1.4rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                  active
                    ? "bg-cyan-200 text-slate-950"
                    : "bg-amber-400 text-slate-950"
                )}
              >
                {notificationCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function DesktopDashboardNav({ role, notificationCount }: { role: NavRole; notificationCount: number }) {
  return <NavLinks role={role} notificationCount={notificationCount} />;
}

export function MobileDashboardNav({
  role,
  name,
  notificationCount,
  actions
}: {
  role: NavRole;
  name: string;
  notificationCount: number;
  actions: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const asideRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const originalOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mounted, open]);

  useEffect(() => {
    if (open) return;

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement && asideRef.current?.contains(activeElement)) {
      activeElement.blur();
      triggerRef.current?.focus();
    }
  }, [open]);

  const mobileMenu = (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/45 transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        ref={asideRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-80 max-w-[88vw] flex-col bg-slate-950 px-5 py-6 text-slate-100 shadow-2xl transition-transform duration-200 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="mb-2 flex items-start justify-between gap-1">
          <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/5 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex h-16 w-16 items-center justify-center">
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
          <Button type="button" variant="ghost" size="sm" className="text-slate-200 hover:bg-white/5" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavLinks role={role} notificationCount={notificationCount} onNavigate={() => setOpen(false)} />
        </div>

        <div
          className="mt-6 border-t border-white/10 pt-4"
          onClick={() => {
            const activeElement = document.activeElement;
            if (activeElement instanceof HTMLElement) activeElement.blur();
            setOpen(false);
          }}
        >
          {actions}
        </div>
      </aside>
    </>
  );

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="default"
        className="h-10 w-10 rounded-xl px-0 lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5 stroke-[2.6]" />
        <span className="sr-only">Open menu</span>
      </Button>
      {mounted ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
