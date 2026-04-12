"use client";

import { useDeferredValue, useState } from "react";
import { ContributionForm } from "@/components/forms/contribution-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataScroll } from "@/components/ui/data-scroll";
import { formatDate, formatMoney } from "@/lib/utils";

type MemberOption = {
  id: string;
  name: string;
  username: string;
};

type ContributionRow = {
  id: string;
  memberId: string;
  amount: number;
  contributionDate: string | Date;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string | Date;
};

export function ContributionsAdminClient({
  members,
  rows,
  staffView
}: {
  members: MemberOption[];
  rows: ContributionRow[];
  staffView: boolean;
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(staffView ? "" : members[0]?.id || "");
  const deferredSelectedMemberId = useDeferredValue(selectedMemberId);
  const selectedMember = members.find((member) => member.id === deferredSelectedMemberId);
  const filteredRows = deferredSelectedMemberId
    ? rows.filter((row) => row.memberId === deferredSelectedMemberId)
    : [];

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Financial Administration</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Contributions</h1>
        {!staffView ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Submit your own contribution records for admin review. Only approved entries are included in totals and standings.
          </p>
        ) : null}
      </div>
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-stretch">
        <ContributionForm
          members={members.map((member) => ({
            id: member.id,
            name: member.name || member.username,
            username: member.username
          }))}
          selectedMemberId={selectedMemberId}
          onSelectedMemberChange={setSelectedMemberId}
          memberLocked={!staffView}
        />
        <Card className="min-w-0 h-full min-h-[34rem]">
          <CardHeader>
            <CardTitle>{staffView ? "Recent Contributions" : "Your Contribution Requests"}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              {selectedMember
                ? `Displaying contributions for ${selectedMember.name || selectedMember.username}.`
                : staffView
                  ? "Select a member to view contribution records."
                  : "Your pending, approved, and rejected contribution submissions appear here."}
            </p>
            {staffView ? (
            <div className="mt-4 w-full max-w-md">
              <label htmlFor="contributionMemberId" className="mb-2 block text-sm font-medium text-slate-700">Selected Member</label>
              <select
                id="contributionMemberId"
                value={selectedMemberId}
                onChange={(event) => setSelectedMemberId(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                <option value="">Choose member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name || member.username}
                  </option>
                ))}
              </select>
            </div>
            ) : null}
          </CardHeader>
          <CardContent className="flex min-w-0 flex-1 flex-col">
            <p className="scroll-hint">Scroll sideways to view all contribution columns.</p>
            <DataScroll className="mt-2">
              <table className="data-table min-w-[560px]">
                <thead><tr><th>S/N</th><th>Amount</th><th>Date</th>{!staffView ? <th>Status</th> : null}</tr></thead>
                <tbody>
                  {filteredRows.length ? filteredRows.map((row, index) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap">{filteredRows.length - index}</td>
                      <td className="whitespace-nowrap">{formatMoney(Number(row.amount))}</td>
                      <td className="whitespace-nowrap">{formatDate(row.contributionDate)}</td>
                      {!staffView ? <td className="whitespace-nowrap">{row.approvalStatus}</td> : null}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={!staffView ? 4 : 3} className="text-sm text-slate-500">
                        {selectedMemberId ? "No contributions found for the selected member." : "No member selected."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DataScroll>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
