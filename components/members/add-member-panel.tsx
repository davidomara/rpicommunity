"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { createMemberAction, type CreateMemberFormState } from "@/app/(dashboard)/members/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreateMemberFormState = {
  success: false,
  message: "",
  error: ""
};

const selectClassName = "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AddMemberPanel() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(createMemberAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.success) return;

    formRef.current?.reset();
    setOpen(false);
  }, [state.success]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" onClick={() => setOpen((value) => !value)} className="w-full sm:w-auto">
          {open ? "Hide Add Member Form" : "Add New Member"}
        </Button>
        {state.success && state.message ? <p className="text-sm text-emerald-700">{state.message}</p> : null}
      </div>

      {open ? (
        <Card id="add-member">
          <CardHeader>
            <CardTitle>Add Member To Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Member Status</Label>
                <select id="status" name="status" defaultValue="ACTIVE" className={selectClassName} required>
                  <option value="ACTIVE">Active</option>
                  <option value="WARNING">Warning</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temporaryPin">Temporary PIN</Label>
                <Input id="temporaryPin" name="temporaryPin" type="password" defaultValue="Member@123" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmTemporaryPin">Confirm Temporary PIN</Label>
                <Input id="confirmTemporaryPin" name="confirmTemporaryPin" type="password" defaultValue="Member@123" required />
              </div>
              <div className="md:col-span-2 xl:col-span-3">
                <p className="mb-4 text-xs text-slate-500">Best option: create the member with a temporary PIN, then ask them to change it from Account Settings after first login.</p>
                {state.error ? <p className="mb-4 text-sm text-red-600">{state.error}</p> : null}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <SubmitButton label="Create Member" pendingLabel="Creating..." />
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
