"use client";

import { useFormState } from "react-dom";
import { resetPasswordAction, type ResetPasswordFormState } from "@/app/(auth)/reset-password/actions";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage } from "@/components/forms/form-message";

const initialState: ResetPasswordFormState = {
  success: false,
  error: "",
  message: ""
};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      <FormMessage type="error" message={state.error} />
      <FormMessage type="success" message={state.message} />
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <PasswordInput id="password" name="password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <PasswordInput id="confirmPassword" name="confirmPassword" required />
      </div>
      <SubmitButton label="Reset password" pendingLabel="Updating..." className="w-full sm:w-auto" />
    </form>
  );
}
