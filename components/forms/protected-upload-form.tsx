"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import type { ProtectedUploadFormState } from "@/app/(dashboard)/bank-statements/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage } from "@/components/forms/form-message";

const initialState: ProtectedUploadFormState = {
  success: false,
  error: "",
  message: ""
};

export function ProtectedUploadForm({
  action,
  submitLabel,
  pendingLabel,
  hint
}: {
  action: (state: ProtectedUploadFormState, formData: FormData) => Promise<ProtectedUploadFormState>;
  submitLabel: string;
  pendingLabel: string;
  hint: string;
}) {
  const [state, formAction] = useFormState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center">
      <input type="file" name="file" accept=".pdf,image/*" required className="upload-file-input md:flex-1" />
      <SubmitButton label={submitLabel} pendingLabel={pendingLabel} className="w-full whitespace-nowrap md:w-auto" />
      <div className="w-full space-y-3">
        <FormMessage type="error" message={state.error} />
        <FormMessage type="success" message={state.message} />
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
    </form>
  );
}
