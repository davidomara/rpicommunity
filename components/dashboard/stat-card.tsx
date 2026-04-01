import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{note}</p>
      </CardContent>
    </Card>
  );
}
