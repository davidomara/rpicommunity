"use client";

import { useMemo, useState } from "react";
import type { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataScroll } from "@/components/ui/data-scroll";
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
    status: string;
    contributions: number;
    withdrawals: number;
    pending: number;
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
          <table className="data-table min-w-[1180px]">
            <colgroup>
              <col className="w-[6%]" />
              <col className="w-[26%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              {showActions ? <col className="w-[16%]" /> : null}
            </colgroup>
            <thead>
              <tr>
                <th className="whitespace-nowrap">S/N</th>
                <th className="whitespace-nowrap">Member</th>
                <th className="whitespace-nowrap">Contributions</th>
                <th className="whitespace-nowrap">Arrears</th>
                <th className="whitespace-nowrap">Withdrawals</th>
                <th className="whitespace-nowrap">Pending Emergency</th>
                <th className="whitespace-nowrap">Status</th>
                {showActions ? <th className="whitespace-nowrap">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, index) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap pr-4 text-slate-500">{index + 1}</td>
                  <td className="min-w-[260px] pr-6">
                    <div className="font-medium text-slate-900">{row.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{row.email}</div>
                  </td>
                  <td className="whitespace-nowrap pr-6 text-slate-900">{formatMoney(row.contributions)}</td>
                  <td className="whitespace-nowrap pr-6 text-slate-900">{formatMoney(row.arrears)}</td>
                  <td className="whitespace-nowrap pr-6 text-slate-900">{formatMoney(row.withdrawals)}</td>
                  <td className="whitespace-nowrap pr-6 text-slate-900">{row.pending}</td>
                  <td className="whitespace-nowrap"><Badge value={row.status} className="min-w-[88px] justify-center" /></td>
                  {showActions ? (
                    <td className="min-w-[220px]">
                      <MemberStatusActions
                        memberId={row.id}
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
