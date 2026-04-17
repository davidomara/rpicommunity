import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MemberStatusCard({
  active,
  warning,
  closed,
  total
}: {
  active: number;
  warning: number;
  closed: number;
  total: number;
}) {
  return (
    <Card className="relative w-full max-w-full overflow-hidden border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:shadow-soft">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-slate-700" />
      <CardHeader className="px-4 pb-2 pt-4 sm:px-6 sm:pt-4">
        <CardTitle className="text-[0.95rem] font-medium text-slate-700 sm:text-sm">Member Status</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-1 sm:px-6 sm:pb-5">
        <div className="grid grid-cols-3 gap-2">
          <div className="min-w-0 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-2">
            <p className="truncate text-[9px] font-semibold uppercase tracking-[0.08em] text-emerald-700 sm:text-[10px]">Active</p>
            <p className="mt-1 text-xl font-semibold text-emerald-950">{active}</p>
          </div>
          <div className="min-w-0 rounded-xl border border-amber-200 bg-amber-50 px-2 py-2">
            <p className="truncate text-[9px] font-semibold uppercase tracking-[0.03em] text-amber-700 sm:text-[10px] sm:tracking-[0.05em]">Warning</p>
            <p className="mt-1 text-xl font-semibold text-amber-950">{warning}</p>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
            <p className="truncate text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-700 sm:text-[10px]">Closed</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{closed}</p>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-slate-500 sm:text-xs">Status distribution across {total} members.</p>
      </CardContent>
    </Card>
  );
}
