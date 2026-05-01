"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { createWithdrawalAction, type WithdrawalFormState } from "@/app/(dashboard)/withdrawals/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, getTodayISODate } from "@/lib/utils";

const initialState: WithdrawalFormState = {
  success: false,
  error: "",
  message: ""
};

export function WithdrawalForm({
  members,
  selectedMemberId,
  onSelectedMemberChange
}: {
  members: Array<{ id: string; name: string; username: string; availableSavings: number }>;
  selectedMemberId?: string;
  onSelectedMemberChange?: (memberId: string) => void;
}) {
  const [state, formAction] = useFormState(createWithdrawalAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const selectedMember = members.find((member) => member.id === selectedMemberId);
  const availableSavings = selectedMember?.availableSavings ?? 0;
  const hasAvailableSavings = availableSavings > 0;

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
  }, [state.success]);

  return (
    <Card className="min-w-0 h-full min-h-[34rem]">
      <CardHeader><CardTitle>Add Withdrawal</CardTitle></CardHeader>
      <CardContent className="flex min-w-0 flex-1 flex-col">
        <form
          ref={formRef}
          action={formAction}
          onReset={() => onSelectedMemberChange?.("")}
          className="grid flex-1 content-start gap-4 md:grid-cols-2"
        >
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="memberId">Member</Label>
            <select
              id="memberId"
              name="memberId"
              value={selectedMemberId || ""}
              onChange={(event) => onSelectedMemberChange?.(event.target.value)}
              required
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Select member</option>
              {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
            </select>
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="1"
              max={hasAvailableSavings ? availableSavings : undefined}
              step="0.01"
              required
              disabled={!hasAvailableSavings}
            />
            {selectedMember ? (
              <p className="text-xs text-slate-500">
                Enter an amount up to {formatMoney(availableSavings)}.
              </p>
            ) : null}
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="withdrawalDate">Withdrawal Date</Label>
            <Input id="withdrawalDate" name="withdrawalDate" type="date" defaultValue={getTodayISODate()} max={getTodayISODate()} required />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              name="reason"
              required
              rows={2}
              className="min-h-[64px] resize-y overflow-auto"
            />
          </div>
          <div className="mt-auto md:col-span-2">
            <div className="mb-3 space-y-3">
              <FormMessage type="error" message={state.error} />
              <FormMessage type="success" message={state.success ? state.message : ""} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <SubmitButton label="Save Withdrawal" pendingLabel="Saving..." className="w-full sm:w-auto" disabled={!hasAvailableSavings} />
              <Button type="reset" variant="outline" className="w-full border-amber-200 bg-amber-50 font-medium text-amber-800 hover:bg-amber-100 sm:w-auto">
                Clear
              </Button>
            </div>
            <div className="mt-4 w-full overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm leading-6 text-slate-600">
              <p className="font-medium text-emerald-800">Withdrawal note</p>
              <p className="mt-1">
                Only approved contributions above the expected monthly amount count as savings, and withdrawals can only be made from that savings balance.
              </p>
              {selectedMember ? (
                <p className="mt-2 text-xs text-emerald-900/80">
                  Current withdrawable savings for {selectedMember.name}: <span className="font-semibold">{formatMoney(selectedMember.availableSavings)}</span>
                </p>
              ) : null}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
