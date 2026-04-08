"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { createEmergencyRequestAction, type EmergencyRequestFormState } from "@/app/(dashboard)/emergency-requests/actions";
import { Button } from "@/components/ui/button";
import { EmergencyRequestForm } from "@/components/forms/emergency-request-form";

const initialState: EmergencyRequestFormState = {
  success: false,
  error: ""
};

export function EmergencyRequestPanel({
  memberId,
  isAdmin,
  members
}: {
  memberId: string;
  isAdmin: boolean;
  members: Array<{ id: string; name: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(createEmergencyRequestAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.success) return;

    formRef.current?.reset();
    setOpen(false);
  }, [state.success]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-cyan-700">Emergency Support</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Emergency Requests</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Members can request emergency assistance. Admins can review and decide requests.</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="self-start whitespace-nowrap px-5 sm:self-auto"
          >
            {open ? "Hide Request Form" : "Submit Emergency Request"}
          </Button>
          {state.success ? <p className="max-w-xs text-sm text-emerald-700 sm:text-right">Emergency request submitted successfully.</p> : null}
        </div>
      </div>

      {open ? (
        <EmergencyRequestForm
          action={formAction}
          formRef={formRef}
          error={state.error}
          memberId={memberId}
          isAdmin={isAdmin}
          members={members}
          onCancel={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
