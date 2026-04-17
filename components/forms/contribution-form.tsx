"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { createContributionAction, type ContributionFormState } from "@/app/(dashboard)/contributions/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayISODate } from "@/lib/utils";

const initialState: ContributionFormState = {
  success: false,
  error: "",
  message: ""
};

export function ContributionForm({
  members,
  selectedMemberId,
  onSelectedMemberChange,
  memberLocked = false
}: {
  members: Array<{ id: string; name: string; username: string }>;
  selectedMemberId?: string;
  onSelectedMemberChange?: (memberId: string) => void;
  memberLocked?: boolean;
}) {
  const [state, formAction] = useFormState(createContributionAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
    router.refresh();
  }, [router, state.success]);

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
          {memberLocked ? (
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="memberName">Member</Label>
              <Input
                id="memberName"
                value={members[0]?.name || ""}
                readOnly
                className="bg-slate-50"
              />
              <input type="hidden" name="memberId" value={members[0]?.id || ""} />
            </div>
          ) : (
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
          )}
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" min="1" step="0.01" required />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="contributionDate">Contribution Date</Label>
            <Input id="contributionDate" name="contributionDate" type="date" defaultValue={getTodayISODate()} max={getTodayISODate()} required />
          </div>
          <div className="mt-auto md:col-span-2">
            <div className="mb-3 space-y-3">
              <FormMessage type="error" message={state.error} />
              <FormMessage type="success" message={state.success ? state.message : ""} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <SubmitButton label={memberLocked ? "Submit Contribution" : "Save Contribution"} pendingLabel={memberLocked ? "Submitting..." : "Saving..."} className="w-full sm:w-auto" />
              <Button type="reset" variant="outline" className="w-full border-amber-200 bg-amber-50 font-medium text-amber-800 hover:bg-amber-100 sm:w-auto">
                Clear
              </Button>
            </div>
            <div className="mt-4 w-full overflow-hidden rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-sm leading-6 text-slate-600">
              <p className="font-medium text-cyan-800">Contribution note</p>
              <p className="mt-1">
                Record each member payment with the correct date and amount so the community balance, arrears,
                and member standing remain accurate from the start of the April 2026 contribution cycle.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
