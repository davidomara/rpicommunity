"use client";

import { RefObject } from "react";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmergencyRequestForm({
  action,
  formRef,
  error,
  memberId,
  isAdmin,
  members,
  onCancel
}: {
  action: (formData: FormData) => void;
  formRef: RefObject<HTMLFormElement>;
  error: string;
  memberId: string;
  isAdmin: boolean;
  members: Array<{ id: string; name: string }>;
  onCancel?: () => void;
}) {
  return (
    <Card>
      <CardHeader><CardTitle>Submit Emergency Request</CardTitle></CardHeader>
      <CardContent>
        <form ref={formRef} action={action} className="grid gap-4">
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
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <SubmitButton label="Submit Request" pendingLabel="Submitting..." />
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
