import type { ReactNode } from "react";
import { SettingsSectionNav } from "@/components/settings/settings-section-nav";

export default function SettingsLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Security Administration</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Settings</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Manage access roles, granular permissions, and assignment workflows from one centralized RBAC area.
        </p>
      </div>
      <SettingsSectionNav />
      {children}
    </div>
  );
}
