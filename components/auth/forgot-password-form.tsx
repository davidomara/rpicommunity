"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { requestResetAction, type RequestResetFormState } from "@/app/(auth)/forgot-password/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage } from "@/components/forms/form-message";

const initialState: RequestResetFormState = {
  success: false,
  error: "",
  message: ""
};

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(requestResetAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-4">
      <FormMessage type="error" message={state.error} />
      <FormMessage type="success" message={state.message} />
      <div className="space-y-2">
        <Label htmlFor="identifier">Username or Email</Label>
        <Input id="identifier" name="identifier" required />
      </div>
      <SubmitButton label="Send reset link" pendingLabel="Sending..." className="w-full sm:w-auto" />
    </form>
  );
}
