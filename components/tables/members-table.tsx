"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataScroll } from "@/components/ui/data-scroll";
import type { Role } from "@/lib/domain-types";
import { formatMoney } from "@/lib/utils";
import { MemberStatusActions } from "@/components/members/member-status-actions";

export function MembersTable({
  rows,
  role
}: {
  rows: Array<{
    id: string;
    name: string;
    email: string;
    role: Role;
    status: string;
    contributions: number;
    withdrawals: number;
    savings: number;
    arrears: number;
    pendingStatusChange?: {
      id: string;
      currentStatus: string;
      requestedStatus: string;
      adminApproved: boolean;
      treasurerApproved: boolean;
    } | null;
  }>;
  role?: Role;
}) {
  const [query, setQuery] = useState("");
  const showActions = role === "ADMIN" || role === "TREASURER";
  const filtered = useMemo(() => rows.filter((row) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q);
  }), [rows, query]);

  return (
    <div className="min-w-0 space-y-4">
      <Input placeholder="Search members by name or email" value={query} onChange={(event) => setQuery(event.target.value)} />
      <div className="min-w-0 rounded-lg border bg-white shadow-soft">
        <DataScroll className="px-0 max-h-[520px] overflow-auto touch-auto">
          <table className="data-table w-full table-auto">
            <thead>
              <tr>
                <th className="whitespace-nowrap">S/N</th>
                <th className="whitespace-nowrap">Member</th>
                <th className="whitespace-nowrap">Contributions</th>
                <th className="whitespace-nowrap">Arrears</th>
                <th className="whitespace-nowrap">Withdrawals</th>
                <th className="whitespace-nowrap">Savings</th>
                <th className="whitespace-nowrap">Status</th>
                {showActions ? <th className="whitespace-nowrap">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, index) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap pr-3 text-slate-500">{index + 1}</td>
                  <td className="min-w-[240px] pr-4">
                    <div className="font-medium text-slate-900">{row.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{row.email}</div>
                    <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{row.role}</div>
                  </td>
                  <td className="whitespace-nowrap pr-4 text-slate-900">{formatMoney(row.contributions)}</td>
                  <td className="whitespace-nowrap pr-4 text-slate-900">{formatMoney(row.arrears)}</td>
                  <td className="whitespace-nowrap pr-4 text-slate-900">{formatMoney(row.withdrawals)}</td>
                  <td className="whitespace-nowrap pr-4 text-slate-900">{formatMoney(row.savings)}</td>
                  <td className="whitespace-nowrap pr-3"><Badge value={row.status} className="min-w-[88px] justify-center" /></td>
                  {showActions ? (
                    <td className="min-w-[220px]">
                      <MemberStatusActions
                        memberId={row.id}
                        currentRole={row.role}
                        currentStatus={row.status}
                        actorRole={role!}
                        pendingChange={row.pendingStatusChange}
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </DataScroll>
      </div>
    </div>
  );
}
