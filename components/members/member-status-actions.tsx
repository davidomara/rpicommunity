"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Pencil } from "lucide-react";
import type { Role } from "@prisma/client";
import { decideMemberStatusChangeAction, requestMemberStatusChangeAction, type MemberStatusChangeFormState } from "@/app/(dashboard)/members/actions";
import { Button } from "@/components/ui/button";

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
  const requestedStatusRef = useRef<HTMLInputElement>(null);

  if (!pendingChange) {
    if (actorRole !== "ADMIN") return <span className="text-xs text-slate-400">No action</span>;

    return (
      <div className="space-y-2">
        <form action={requestAction}>
          <input type="hidden" name="memberId" value={memberId} />
          <input ref={requestedStatusRef} type="hidden" name="requestedStatus" value={currentStatus} />
          <ActionButton
            variant="outline"
            onClick={(event) => {
              const nextStatus = window.prompt(
                "Enter the new member status: ACTIVE, WARNING, or CLOSED.",
                currentStatus
              );

              if (!nextStatus) {
                event.preventDefault();
                return;
              }

              const normalized = nextStatus.trim().toUpperCase();
              if (!["ACTIVE", "WARNING", "CLOSED"].includes(normalized)) {
                event.preventDefault();
                window.alert("Enter one of: ACTIVE, WARNING, CLOSED.");
                return;
              }

              if (normalized === currentStatus) {
                event.preventDefault();
                window.alert("Choose a different status.");
                return;
              }

              if (requestedStatusRef.current) {
                requestedStatusRef.current.value = normalized;
              }
            }}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </ActionButton>
        </form>
        {requestState.error ? <p className="text-xs text-red-600">{requestState.error}</p> : null}
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
      {decisionState.error ? <p className="text-xs text-red-600">{decisionState.error}</p> : null}
    </div>
  );
}
