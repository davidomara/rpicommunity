"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
        <div className="overflow-x-auto">
          <table className="data-table min-w-full">
            <thead>
              <tr>
                <th>Member</th>
                <th>Contributions</th>
                <th>Withdrawals</th>
                <th>Pending Emergency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="font-medium text-slate-900">{row.name}</div>
                    <div className="text-xs text-slate-500">{row.email}</div>
                  </td>
                  <td>{formatMoney(row.contributions)}</td>
                  <td>{formatMoney(row.withdrawals)}</td>
                  <td>{row.pending}</td>
                  <td><Badge value={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
