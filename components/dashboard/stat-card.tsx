import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardPalette, type DashboardTone } from "@/components/dashboard/palette";

export function StatCard({
  title,
  value,
  note,
  tone = "closed"
}: {
  title: string;
  value: string;
  note: string;
  tone?: DashboardTone;
}) {
  const styles = dashboardPalette[tone];

  return (
    <Card className={cn("relative w-full max-w-full overflow-hidden border shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:shadow-soft", styles.card)}>
      <div className={cn("absolute inset-x-0 top-0 h-1.5", styles.accent)} />
      <CardHeader className="px-4 pb-2 pt-4 sm:px-6 sm:pt-4">
        <CardTitle className={cn("text-[0.95rem] font-medium sm:text-sm", styles.title)}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-1 sm:px-6 sm:pb-5">
        <p className={cn("break-words text-[1.55rem] font-semibold tracking-tight sm:text-3xl", styles.value)}>{value}</p>
        <p className={cn("mt-1 text-[11px] leading-5 sm:text-xs", styles.note)}>{note}</p>
      </CardContent>
    </Card>
  );
}
