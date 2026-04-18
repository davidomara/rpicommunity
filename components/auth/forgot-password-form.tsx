"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { requestResetAction, type RequestResetFormState } from "@/app/(auth)/forgot-password/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { withBasePath } from "@/lib/app-path";

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton label="Send reset link" pendingLabel="Sending..." className="w-full sm:w-auto" />
        <Button asChild variant="outline" className="w-full sm:ml-auto sm:w-auto">
          <Link href={withBasePath("/login")}>Back to login</Link>
        </Button>
      </div>
    </form>
  );
}
