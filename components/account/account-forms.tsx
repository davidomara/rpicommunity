"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import {
  resetMemberPinAction,
  updateEmailAction,
  updateMemberEmailAction,
  updateMemberStatusThresholdsAction,
  updatePasswordAction,
  type AccountFormState
} from "@/app/(dashboard)/account/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/forms/form-message";

const initialState: AccountFormState = {
  success: false,
  error: "",
  message: ""
};

export function UpdateEmailForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, formAction] = useFormState(updateEmailAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage type="error" message={state.error} />
      <FormMessage type="success" message={state.message} />
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" defaultValue={defaultEmail} required />
      </div>
      <SubmitButton label="Save Email" pendingLabel="Saving..." className="w-full sm:w-auto" />
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useFormState(updatePasswordAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <FormMessage type="error" message={state.error} />
      <FormMessage type="success" message={state.message} />
      <div className="space-y-2"><Label htmlFor="currentPassword">Current Password</Label><PasswordInput id="currentPassword" name="currentPassword" required /></div>
      <div className="space-y-2"><Label htmlFor="newPassword">New Password</Label><PasswordInput id="newPassword" name="newPassword" required /></div>
      <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><PasswordInput id="confirmPassword" name="confirmPassword" required /></div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SubmitButton label="Change Password" pendingLabel="Updating..." className="w-full sm:w-auto" />
        <Button type="reset" variant="outline" className="w-full border-amber-200 bg-amber-50 font-medium text-amber-800 hover:bg-amber-100 sm:w-auto">Clear</Button>
      </div>
    </form>
  );
}

export function UpdateMemberEmailForm({
  members,
  selectClassName
}: {
  members: Array<{ id: string; name: string; username: string }>;
  selectClassName: string;
}) {
  const [state, formAction] = useFormState(updateMemberEmailAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <FormMessage type="error" message={state.error} />
      <FormMessage type="success" message={state.message} />
      <div className="space-y-2">
        <Label htmlFor="memberEmailMemberId">Member</Label>
        <select id="memberEmailMemberId" name="memberId" defaultValue="" className={selectClassName} required>
          <option value="" disabled>Select member account</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name} ({member.username})
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="memberEmail">New Member Email</Label>
        <Input id="memberEmail" name="email" type="email" placeholder="Enter the updated email address" required />
      </div>
      <p className="text-xs text-slate-500">Select the member, then enter the replacement email address to save.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SubmitButton label="Update Member Email" pendingLabel="Saving..." className="w-full sm:w-auto" />
        <Button type="reset" variant="outline" className="w-full border-amber-200 bg-amber-50 font-medium text-amber-800 hover:bg-amber-100 sm:w-auto">Clear</Button>
      </div>
    </form>
  );
}

export function ResetMemberPinForm({
  members,
  selectClassName
}: {
  members: Array<{ id: string; name: string; username: string }>;
  selectClassName: string;
}) {
  const [state, formAction] = useFormState(resetMemberPinAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <FormMessage type="error" message={state.error} />
      <FormMessage type="success" message={state.message} />
      <div className="space-y-2">
        <Label htmlFor="memberPinMemberId">Member</Label>
        <select id="memberPinMemberId" name="memberId" defaultValue="" className={selectClassName} required>
          <option value="" disabled>Select member account</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name} ({member.username})
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPin">Temporary PIN</Label>
        <PasswordInput id="newPin" name="newPin" defaultValue="Member@123" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPin">Confirm Temporary PIN</Label>
        <PasswordInput id="confirmPin" name="confirmPin" defaultValue="Member@123" required />
      </div>
      <p className="text-xs text-slate-500">Best option: use a temporary PIN, then share it directly with the member and have them change it after login.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SubmitButton label="Reset Member PIN" pendingLabel="Resetting..." className="w-full sm:w-auto" />
        <Button type="reset" variant="outline" className="w-full border-amber-200 bg-amber-50 font-medium text-amber-800 hover:bg-amber-100 sm:w-auto">Clear</Button>
      </div>
    </form>
  );
}

export function MemberStatusAutomationForm({
  warningAfterMonths,
  closeAfterMonths
}: {
  warningAfterMonths: number;
  closeAfterMonths: number;
}) {
  const [state, formAction] = useFormState(updateMemberStatusThresholdsAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage type="error" message={state.error} />
      <FormMessage type="success" message={state.message} />
      <div className="space-y-2">
        <Label htmlFor="warningAfterMonths">Warning After</Label>
        <Input id="warningAfterMonths" name="warningAfterMonths" type="number" min="1" defaultValue={warningAfterMonths} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="closeAfterMonths">Close After</Label>
        <Input id="closeAfterMonths" name="closeAfterMonths" type="number" min="1" defaultValue={closeAfterMonths} required />
      </div>
      <p className="text-xs leading-5 text-slate-500">
        Member status is derived automatically from full months in arrears. A member stays active below the warning
        threshold, moves to warning at the configured month gap, and closes automatically once the higher threshold is reached.
      </p>
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
        Current rule: warning at <strong>{warningAfterMonths}</strong> months in arrears, close at{" "}
        <strong>{closeAfterMonths}</strong> months in arrears.
      </div>
      <SubmitButton label="Save Status Rules" pendingLabel="Saving..." className="w-full sm:w-auto" />
    </form>
  );
}
