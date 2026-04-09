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
    <div className="space-y-4">
      <Input placeholder="Search members by name or email" value={query} onChange={(event) => setQuery(event.target.value)} />
      <div className="overflow-hidden rounded-lg border bg-white shadow-soft">
        <p className="scroll-hint px-4 pt-4 sm:px-6">Scroll sideways to view all member columns.</p>
        <DataScroll>
          <table className="data-table min-w-[1040px] lg:min-w-full">
            <colgroup>
              <col className="w-[25%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              {showActions ? <col className="w-[14%]" /> : null}
            </colgroup>
            <thead>
              <tr>
                <th className="whitespace-nowrap">Member</th>
                <th className="whitespace-nowrap">Contributions</th>
                <th className="whitespace-nowrap">Arrears</th>
                <th className="whitespace-nowrap">Withdrawals</th>
                <th className="whitespace-nowrap">Pending Emergency</th>
                <th className="whitespace-nowrap">Status</th>
                {showActions ? <th className="sticky right-0 whitespace-nowrap bg-slate-50 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]">Actions</th> : null}
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
                  <td className="whitespace-nowrap pr-6 text-slate-900">{formatMoney(row.arrears)}</td>
                  <td className="whitespace-nowrap pr-6 text-slate-900">{formatMoney(row.withdrawals)}</td>
                  <td className="whitespace-nowrap pr-6 text-slate-900">{row.pending}</td>
                  <td className="whitespace-nowrap"><Badge value={row.status} className="min-w-[88px] justify-center" /></td>
                  {showActions ? (
                    <td className="sticky right-0 min-w-[190px] bg-white shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]">
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
