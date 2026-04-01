export const dashboardPalette = {
  contributions: {
    bar: "#0369a1",
    card: "border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-sky-50/60",
    accent: "bg-sky-700",
    title: "text-sky-700",
    value: "text-sky-950",
    note: "text-sky-900/70"
  },
  warning: {
    bar: "#f59e0b",
    card: "border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-amber-50/70",
    accent: "bg-amber-500",
    title: "text-amber-700",
    value: "text-amber-950",
    note: "text-amber-900/70"
  },
  withdrawals: {
    bar: "#10b981",
    card: "border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70",
    accent: "bg-emerald-500",
    title: "text-emerald-700",
    value: "text-emerald-950",
    note: "text-emerald-900/70"
  },
  neutral: {
    card: "border-slate-200 bg-white",
    accent: "bg-slate-300",
    title: "text-slate-600",
    value: "text-slate-950",
    note: "text-slate-500"
  }
} as const;

export type DashboardTone = keyof typeof dashboardPalette;
