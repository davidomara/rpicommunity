"use client";

import { useDeferredValue, useState } from "react";
import { ContributionForm } from "@/components/forms/contribution-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
};

export function ContributionsAdminClient({
  members,
  rows
}: {
  members: MemberOption[];
  rows: ContributionRow[];
}) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const deferredSelectedMemberId = useDeferredValue(selectedMemberId);
  const selectedMember = members.find((member) => member.id === deferredSelectedMemberId);
  const filteredRows = deferredSelectedMemberId
    ? rows.filter((row) => row.memberId === deferredSelectedMemberId)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Financial Administration</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Contributions</h1>
      </div>
      <ContributionForm
        members={members.map((member) => ({
          id: member.id,
          name: member.name || member.username,
          username: member.username
        }))}
        selectedMemberId={selectedMemberId}
        onSelectedMemberChange={setSelectedMemberId}
      />
      <Card>
        <CardHeader>
          <CardTitle>Recent Contributions</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            {selectedMember
              ? `Displaying contributions for ${selectedMember.name || selectedMember.username}.`
              : "Select a member to view contribution records."}
          </p>
          <div className="mt-4 max-w-md">
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
        </CardHeader>
        <CardContent className="scroll-x">
          <table className="data-table min-w-[560px]">
            <thead><tr><th>ID</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {filteredRows.length ? filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap">{row.id.slice(-8)}</td>
                  <td className="whitespace-nowrap">{formatMoney(Number(row.amount))}</td>
                  <td className="whitespace-nowrap">{formatDate(row.contributionDate)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="text-sm text-slate-500">
                    {selectedMemberId ? "No contributions found for the selected member." : "No member selected."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
