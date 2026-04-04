import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardPalette, type DashboardTone } from "@/components/dashboard/palette";

export function StatCard({
  title,
  value,
  note,
  tone = "neutral"
}: {
  title: string;
  value: string;
  note: string;
  tone?: DashboardTone;
}) {
  const styles = dashboardPalette[tone];

  return (
    <Card className={cn("relative overflow-hidden border", styles.card)}>
      <div className={cn("absolute inset-x-0 top-0 h-1.5", styles.accent)} />
      <CardHeader className="pb-2">
        <CardTitle className={cn("text-sm font-medium", styles.title)}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn("break-words text-[2rem] font-semibold tracking-tight sm:text-3xl", styles.value)}>{value}</p>
        <p className={cn("mt-1 text-xs leading-5", styles.note)}>{note}</p>
      </CardContent>
    </Card>
  );
}
