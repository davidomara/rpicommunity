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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-cyan-700">Community Directory</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Members</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">View contribution and withdrawal standing for each RPIC Community member.</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="self-start whitespace-nowrap px-5 sm:self-auto"
          >
            {open ? "Hide Add Member Form" : "Add New Member"}
          </Button>
          {state.success && state.message ? <p className="max-w-xs text-sm text-emerald-700 sm:text-right">{state.message}</p> : null}
        </div>
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
                  <SubmitButton label="Create Member" pendingLabel="Creating..." className="w-full sm:w-auto" />
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full border-amber-200 bg-amber-50 font-medium text-amber-800 hover:bg-amber-100 sm:w-auto">
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
