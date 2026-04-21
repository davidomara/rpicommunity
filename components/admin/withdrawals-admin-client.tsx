"use client";

import { useDeferredValue, useState } from "react";
import { WithdrawalForm } from "@/components/forms/withdrawal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataScroll } from "@/components/ui/data-scroll";
import { formatDate, formatMoney } from "@/lib/utils";

type MemberOption = {
  id: string;
  name: string;
  username: string;
};

type WithdrawalRow = {
  id: string;
  memberId: string;
  amount: number;
  reason: string;
  withdrawalDate: string | Date;
};

export function WithdrawalsAdminClient({
  members,
  rows,
  canCreate
}: {
  members: MemberOption[];
  rows: WithdrawalRow[];
  canCreate: boolean;
}) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const deferredSelectedMemberId = useDeferredValue(selectedMemberId);
  const selectedMember = members.find((member) => member.id === deferredSelectedMemberId);
  const filteredRows = deferredSelectedMemberId
    ? rows.filter((row) => row.memberId === deferredSelectedMemberId)
    : [];

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <p className="text-sm font-medium text-cyan-700">Financial Administration</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Withdrawals</h1>
      </div>
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-stretch">
        {canCreate ? (
          <WithdrawalForm
            members={members.map((member) => ({
              id: member.id,
              name: member.name || member.username,
              username: member.username
            }))}
            selectedMemberId={selectedMemberId}
            onSelectedMemberChange={setSelectedMemberId}
          />
        ) : (
          <Card className="min-w-0 h-full">
            <CardHeader>
              <CardTitle>Withdrawal Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-500">
                You can review withdrawal records, but you do not have permission to create new withdrawals.
              </p>
            </CardContent>
          </Card>
        )}
        <Card className="min-w-0 h-full min-h-[34rem]">
          <CardHeader>
            <CardTitle>Recent Withdrawals</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              {selectedMember
                ? `Displaying withdrawals for ${selectedMember.name || selectedMember.username}.`
                : "Select a member to view withdrawal records."}
            </p>
            <div className="mt-4 w-full max-w-md">
              <label htmlFor="withdrawalMemberId" className="mb-2 block text-sm font-medium text-slate-700">Selected Member</label>
              <select
                id="withdrawalMemberId"
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
          <CardContent className="flex min-w-0 flex-1 flex-col">
            <p className="scroll-hint">Scroll sideways to view all withdrawal columns.</p>
            <DataScroll className="mt-2">
              <table className="data-table min-w-[700px]">
                <thead><tr><th>S/N</th><th>Amount</th><th>Reason</th><th>Date</th></tr></thead>
                <tbody>
                  {filteredRows.length ? filteredRows.map((row, index) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap">{filteredRows.length - index}</td>
                      <td className="whitespace-nowrap">{formatMoney(Number(row.amount))}</td>
                      <td className="min-w-[220px]">{row.reason}</td>
                      <td className="whitespace-nowrap">{formatDate(row.withdrawalDate)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="text-sm text-slate-500">
                        {selectedMemberId ? "No withdrawals found for the selected member." : "No member selected."}
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
