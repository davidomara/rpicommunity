export const dashboardPalette = {
  contributions: {
    bar: "#0369a1",
    card: "border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-sky-50/60",
    accent: "bg-sky-700",
    title: "text-sky-700",
    value: "text-sky-950",
    note: "text-sky-900/70"
  },
  withdrawals: {
    bar: "#dc2626",
    card: "border-rose-200/80 bg-gradient-to-br from-rose-50 via-white to-rose-50/70",
    accent: "bg-rose-500",
    title: "text-rose-700",
    value: "text-rose-950",
    note: "text-rose-900/70"
  },
  balance: {
    bar: "#059669",
    card: "border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70",
    accent: "bg-emerald-600",
    title: "text-emerald-700",
    value: "text-emerald-950",
    note: "text-emerald-900/70"
  },
  arrears: {
    bar: "#d97706",
    card: "border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-amber-50/70",
    accent: "bg-amber-500",
    title: "text-amber-700",
    value: "text-amber-950",
    note: "text-amber-900/70"
  },
  savings: {
    bar: "#7c3aed",
    card: "border-fuchsia-200/80 bg-gradient-to-br from-fuchsia-50 via-white to-fuchsia-50/70",
    accent: "bg-fuchsia-600",
    title: "text-fuchsia-700",
    value: "text-fuchsia-950",
    note: "text-fuchsia-900/70"
  },
  emergency: {
    bar: "#8b5cf6",
    card: "border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-violet-50/70",
    accent: "bg-violet-600",
    title: "text-violet-700",
    value: "text-violet-950",
    note: "text-violet-900/70"
  },
  active: {
    bar: "#0f766e",
    card: "border-teal-200/80 bg-gradient-to-br from-teal-50 via-white to-teal-50/70",
    accent: "bg-teal-600",
    title: "text-teal-700",
    value: "text-teal-950",
    note: "text-teal-900/70"
  },
  warning: {
    bar: "#d97706",
    card: "border-orange-200/80 bg-gradient-to-br from-orange-50 via-white to-orange-50/70",
    accent: "bg-orange-500",
    title: "text-orange-700",
    value: "text-orange-950",
    note: "text-orange-900/70"
  },
  closed: {
    bar: "#64748b",
    card: "border-slate-200 bg-white",
    accent: "bg-slate-400",
    title: "text-slate-700",
    value: "text-slate-950",
    note: "text-slate-500"
  }
} as const;

export type DashboardTone = keyof typeof dashboardPalette;
