"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { createContributionAction, type ContributionFormState } from "@/app/(dashboard)/contributions/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayISODate } from "@/lib/utils";

const initialState: ContributionFormState = {
  success: false,
  error: ""
};

export function ContributionForm({
  members,
  selectedMemberId,
  onSelectedMemberChange
}: {
  members: Array<{ id: string; name: string; username: string }>;
  selectedMemberId?: string;
  onSelectedMemberChange?: (memberId: string) => void;
}) {
  const [state, formAction] = useFormState(createContributionAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
  }, [state.success]);

  return (
    <Card className="min-w-0 h-full min-h-[34rem]">
      <CardHeader><CardTitle>Add Contribution</CardTitle></CardHeader>
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
            <Input id="amount" name="amount" type="number" min="1" step="0.01" required />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="contributionDate">Contribution Date</Label>
            <Input id="contributionDate" name="contributionDate" type="date" defaultValue={getTodayISODate()} max={getTodayISODate()} required />
          </div>
          <div className="mt-auto md:col-span-2">
            {state.error ? <p className="mb-3 text-sm text-red-600">{state.error}</p> : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <SubmitButton label="Save Contribution" pendingLabel="Saving..." className="w-full sm:w-auto" />
              <Button type="reset" variant="outline" className="w-full border-amber-200 bg-amber-50 font-medium text-amber-800 hover:bg-amber-100 sm:w-auto">
                Clear
              </Button>
            </div>
            <div className="mt-4 w-full overflow-hidden rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-sm leading-6 text-slate-600">
              <p className="font-medium text-cyan-800">Contribution note</p>
              <p className="mt-1">
                Record each member payment with the correct date and amount so the community balance, arrears,
                and member standing remain accurate from the start of the May 2026 contribution cycle.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
