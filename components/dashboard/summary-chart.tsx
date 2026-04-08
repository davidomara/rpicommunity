"use client";

import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardPalette } from "@/components/dashboard/palette";
import { DataScroll } from "@/components/ui/data-scroll";

export function SummaryChart({ data }: { data: Array<{ name: string; contributions: number; missing: number; withdrawals: number }> }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Member Contribution Status</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <DataScroll>
          <div className="h-[300px] min-w-[560px] w-full sm:h-[340px] sm:min-w-[640px] md:min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 10, right: 12, left: 12, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={132} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="contributions" fill={dashboardPalette.contributions.bar} radius={3} />
                <Bar dataKey="missing" fill={dashboardPalette.warning.bar} radius={3} />
                <Bar dataKey="withdrawals" fill={dashboardPalette.withdrawals.bar} radius={3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DataScroll>
      </CardContent>
    </Card>
  );
}
