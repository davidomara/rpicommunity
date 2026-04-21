"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const settingsSections = [
  { href: "/settings/roles", label: "Roles" },
  { href: "/settings/permissions", label: "Permissions" }
];

export function SettingsSectionNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Settings sections">
      {settingsSections.map((section) => {
        const active = pathname === section.href || pathname.startsWith(`${section.href}/`);

        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              active
                ? "border-cyan-300 bg-cyan-50 text-cyan-950"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
