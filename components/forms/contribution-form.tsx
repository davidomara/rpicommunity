"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { createContributionAction, type ContributionFormState } from "@/app/(dashboard)/contributions/actions";
import { SubmitButton } from "@/components/forms/submit-button";
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
    <Card>
      <CardHeader><CardTitle>Add Contribution</CardTitle></CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="grid gap-4 md:grid-cols-2">
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
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" min="1" step="0.01" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contributionDate">Contribution Date</Label>
            <Input id="contributionDate" name="contributionDate" type="date" defaultValue={getTodayISODate()} max={getTodayISODate()} required />
          </div>
          <div className="md:col-span-2">
            {state.error ? <p className="mb-3 text-sm text-red-600">{state.error}</p> : null}
            <SubmitButton label="Save Contribution" pendingLabel="Saving..." />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
