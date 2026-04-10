"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Pencil } from "lucide-react";
import type { Role } from "@prisma/client";
import { decideMemberStatusChangeAction, requestMemberStatusChangeAction, type MemberStatusChangeFormState } from "@/app/(dashboard)/members/actions";
import { Button } from "@/components/ui/button";

const MEMBER_STATUSES = ["ACTIVE", "WARNING", "CLOSED"] as const;
const initialState: MemberStatusChangeFormState = {
  success: false,
  error: ""
};

function ActionButton({
  children,
  variant = "default",
  onClick,
  disabled = false
}: {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button size="sm" variant={variant} type="submit" disabled={pending || disabled} onClick={onClick}>
      {pending ? "Processing..." : children}
    </Button>
  );
}

export function MemberStatusActions({
  memberId,
  currentStatus,
  actorRole,
  pendingChange
}: {
  memberId: string;
  currentStatus: string;
  actorRole: Role;
  pendingChange?: {
    id: string;
    currentStatus: string;
    requestedStatus: string;
    adminApproved: boolean;
    treasurerApproved: boolean;
  } | null;
}) {
  const [requestState, requestAction] = useFormState(requestMemberStatusChangeAction, initialState);
  const [decisionState, decisionAction] = useFormState(decideMemberStatusChangeAction, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const requestedStatusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (requestState.success) {
      setIsOpen(false);
    }
  }, [requestState.success]);

  if (!pendingChange) {
    if (actorRole !== "ADMIN") return <span className="text-xs text-slate-400">No action</span>;

    return (
      <div className="space-y-2">
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => {
            setSelectedStatus(currentStatus);
            setIsOpen(true);
          }}
        >
          <Pencil className="mr-1 h-4 w-4" />
          Edit
        </Button>
        {!isOpen && requestState.success ? <p className="text-xs text-emerald-700">Status change request submitted.</p> : null}
        {!isOpen && requestState.error ? <p className="text-xs text-red-600">{requestState.error}</p> : null}
        {isOpen ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-950">Change Member Status</p>
                <p className="text-sm leading-6 text-slate-500">
                  Request a manual status change for this member. The change is only applied after Admin and Treasurer approval.
                </p>
              </div>
              <form action={requestAction} className="mt-5 space-y-4">
                <input type="hidden" name="memberId" value={memberId} />
                <input ref={requestedStatusRef} type="hidden" name="requestedStatus" value={selectedStatus} />
                <div className="space-y-2">
                  <label htmlFor={`member-status-${memberId}`} className="text-sm font-medium text-slate-700">
                    New Status
                  </label>
                  <select
                    id={`member-status-${memberId}`}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={selectedStatus}
                    onChange={(event) => {
                      setSelectedStatus(event.target.value);
                      if (requestedStatusRef.current) {
                        requestedStatusRef.current.value = event.target.value;
                      }
                    }}
                  >
                    {MEMBER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                {requestState.error ? <p className="text-xs text-red-600">{requestState.error}</p> : null}
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-amber-300 bg-amber-50 font-semibold text-amber-800 hover:bg-amber-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <ActionButton disabled={selectedStatus === currentStatus}>Submit Request</ActionButton>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  const alreadyApproved = actorRole === "ADMIN" ? pendingChange.adminApproved : actorRole === "TREASURER" ? pendingChange.treasurerApproved : true;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-500">
        Pending: {pendingChange.currentStatus} to {pendingChange.requestedStatus}
      </p>
      <div className="flex flex-wrap gap-2">
        <form action={decisionAction}>
          <input type="hidden" name="requestId" value={pendingChange.id} />
          <input type="hidden" name="decision" value="APPROVED" />
          <ActionButton disabled={alreadyApproved}>
            {alreadyApproved ? "Approved" : "Approve"}
          </ActionButton>
        </form>
        <form action={decisionAction}>
          <input type="hidden" name="requestId" value={pendingChange.id} />
          <input type="hidden" name="decision" value="REJECTED" />
          <ActionButton variant="destructive" disabled={alreadyApproved}>
            Reject
          </ActionButton>
        </form>
      </div>
      {decisionState.success ? <p className="text-xs text-emerald-700">Decision recorded successfully.</p> : null}
      {decisionState.error ? <p className="text-xs text-red-600">{decisionState.error}</p> : null}
    </div>
  );
}
