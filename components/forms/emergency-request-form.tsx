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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
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
              <SubmitButton label="Submit Request" pendingLabel="Submitting..." className="w-full sm:w-auto" />
              {onCancel ? (
                <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
          <aside className="rounded-2xl border border-amber-100 bg-amber-50/80 px-5 py-4 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-amber-900">Emergency support guidance</p>
            <p className="mt-2">
              Use this request only for urgent member needs that require community intervention, such as medical,
              bereavement, family crisis, or other exceptional hardship.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <p className="font-medium text-slate-800">Before you submit</p>
                <p className="mt-1 text-slate-600">State the amount clearly and explain the emergency in direct, specific terms.</p>
              </div>
              <div>
                <p className="font-medium text-slate-800">Approval flow</p>
                <p className="mt-1 text-slate-600">Requests are reviewed first, then money is disbursed only after the required approvals are completed.</p>
              </div>
              <div>
                <p className="font-medium text-slate-800">Record quality</p>
                <p className="mt-1 text-slate-600">Accurate reasons help the Admin and Treasurer make faster, defensible decisions.</p>
              </div>
            </div>
          </aside>
        </div>
      </CardContent>
    </Card>
  );
}
