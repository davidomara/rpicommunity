"use client";

import { useMemo, useState } from "react";
import { Copy, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataScroll } from "@/components/ui/data-scroll";
import type { Role } from "@/lib/domain-types";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toaster";
import { formatMoney } from "@/lib/utils";
import { MemberStatusActions } from "@/components/members/member-status-actions";
import { compareCommunityNames } from "@/lib/community-order";

export function MembersTable({
  rows,
  actorAccessRoleKey,
  canEdit,
  canReview
}: {
  rows: Array<{
    id: string;
    name: string;
    username: string;
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
  actorAccessRoleKey: string;
  canEdit: boolean;
  canReview: boolean;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [alphabetOrder, setAlphabetOrder] = useState<"RANK" | "A_Z" | "Z_A">("RANK");

  async function copyText(value: string) {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!copied) {
      throw new Error("Clipboard copy command failed");
    }
  }

  async function copyEmail(email: string) {
    try {
      await copyText(email);
      showToast({ type: "success", message: `Copied ${email}` });
    } catch {
      showToast({ type: "error", message: "Could not copy email" });
    }
  }

  const showActions = canEdit || canReview;
  const hasActiveFilters = query.trim() !== "" || statusFilter !== "ALL" || alphabetOrder !== "RANK";
  const statusOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.status))).sort((left, right) => left.localeCompare(right)),
    [rows]
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filteredRows = rows.filter((row) => {
      const matchesQuery =
        !q ||
        row.username.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || row.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    return [...filteredRows].sort((left, right) => {
      if (alphabetOrder === "RANK") {
        return compareCommunityNames(left.name, right.name);
      }

      const comparison = left.name.localeCompare(right.name);
      return alphabetOrder === "A_Z" ? comparison : comparison * -1;
    });
  }, [alphabetOrder, query, rows, statusFilter]);

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 lg:flex-none">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 min-w-[140px] flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 sm:flex-none"
          >
            <option value="ALL">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={alphabetOrder}
            onChange={(event) => setAlphabetOrder(event.target.value as "RANK" | "A_Z" | "Z_A")}
            className="h-10 min-w-[140px] flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 sm:flex-none"
          >
            <option value="RANK">Rank order</option>
            <option value="A_Z">Alphabet A-Z</option>
            <option value="Z_A">Alphabet Z-A</option>
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setQuery("");
              setStatusFilter("ALL");
              setAlphabetOrder("RANK");
            }}
            disabled={!hasActiveFilters}
            className="h-10 px-3 text-slate-600"
            aria-label="Clear member filters"
            title="Clear filters and return to rank order"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          <Input
            placeholder="Search members by number, name or email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full"
          />
        </div>
      </div>
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
              {filtered.length ? filtered.map((row, index) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap pr-3 text-slate-500">{index + 1}</td>
                  <td className="min-w-[240px] pr-4">
                    <div className="font-medium text-slate-900">{row.name}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span className="select-all">{row.email}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-slate-500 hover:text-slate-900"
                        onClick={() => void copyEmail(row.email)}
                        aria-label={`Copy email for ${row.name}`}
                        title="Copy email"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
                        actorAccessRoleKey={actorAccessRoleKey}
                        canEdit={canEdit}
                        canReview={canReview}
                        pendingChange={row.pendingStatusChange}
                      />
                    </td>
                  ) : null}
                </tr>
              )) : (
                <tr>
                  <td colSpan={showActions ? 8 : 7} className="py-6 text-center text-sm text-slate-500">
                    No members matched the current search and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataScroll>
      </div>
    </div>
  );
}
