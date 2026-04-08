"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataScroll } from "@/components/ui/data-scroll";
import { formatMoney } from "@/lib/utils";

export function MembersTable({ rows }: { rows: Array<{ id: string; name: string; email: string; status: string; contributions: number; withdrawals: number; pending: number }> }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => rows.filter((row) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q);
  }), [rows, query]);

  return (
    <div className="space-y-4">
      <Input placeholder="Search members by name or email" value={query} onChange={(event) => setQuery(event.target.value)} />
      <div className="overflow-hidden rounded-lg border bg-white shadow-soft">
        <p className="scroll-hint px-4 pt-4 sm:px-6">Scroll sideways to view all member columns.</p>
        <DataScroll>
          <table className="data-table min-w-[840px]">
            <colgroup>
              <col className="w-[32%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[17%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead>
              <tr>
                <th className="whitespace-nowrap">Member</th>
                <th className="whitespace-nowrap">Contributions</th>
                <th className="whitespace-nowrap">Withdrawals</th>
                <th className="whitespace-nowrap">Pending Emergency</th>
                <th className="whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td className="min-w-[260px] pr-6">
                    <div className="font-medium text-slate-900">{row.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{row.email}</div>
                  </td>
                  <td className="whitespace-nowrap pr-6 text-slate-900">{formatMoney(row.contributions)}</td>
                  <td className="whitespace-nowrap pr-6 text-slate-900">{formatMoney(row.withdrawals)}</td>
                  <td className="whitespace-nowrap pr-6 text-slate-900">{row.pending}</td>
                  <td className="whitespace-nowrap"><Badge value={row.status} className="min-w-[88px] justify-center" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataScroll>
      </div>
    </div>
  );
}
