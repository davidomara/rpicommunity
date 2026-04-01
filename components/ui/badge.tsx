import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  WARNING: "bg-amber-100 text-amber-800",
  CLOSED: "bg-slate-200 text-slate-700",
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  ADMIN: "bg-sky-100 text-sky-800",
  MEMBER: "bg-slate-100 text-slate-700"
};

export function Badge({ value, className }: { value: string; className?: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", styles[value] || "bg-slate-100 text-slate-700", className)}>{value}</span>;
}
