"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { createEmergencyRequestAction, type EmergencyRequestFormState } from "@/app/(dashboard)/emergency-requests/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: EmergencyRequestFormState = {
  success: false,
  error: ""
};

export function EmergencyRequestForm({ memberId, isAdmin, members }: {
  memberId: string;
  isAdmin: boolean;
  members: Array<{ id: string; name: string }>;
}) {
  const [state, formAction] = useFormState(createEmergencyRequestAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
  }, [state.success]);

  return (
    <Card>
      <CardHeader><CardTitle>Submit Emergency Request</CardTitle></CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="grid gap-4">
          {isAdmin ? (
            <div className="grid gap-2">
              <Label htmlFor="memberId">Member</Label>
              <select id="memberId" name="memberId" defaultValue={memberId} required className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                <option value="">Select member</option>
                {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </div>
          ) : (
            <input type="hidden" name="memberId" value={memberId} />
          )}
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" min="1" step="0.01" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" name="reason" required />
          </div>
          {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
          <SubmitButton label="Submit Request" pendingLabel="Submitting..." />
        </form>
      </CardContent>
    </Card>
  );
}
