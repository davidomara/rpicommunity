"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  approveEmergencyRequestAction,
  rejectEmergencyRequestAction,
  type EmergencyDecisionFormState
} from "@/app/(dashboard)/emergency-requests/actions";
import { Button } from "@/components/ui/button";
import { getDualApprovalActor } from "@/lib/rbac-core";
import { showToast } from "@/components/ui/toaster";
import { formatMoney } from "@/lib/utils";

const initialState: EmergencyDecisionFormState = {
  success: false,
  error: "",
  message: ""
};

function DecisionButton({
  children,
  variant = "default",
  onClick,
  disabled = false
}: {
  children: React.ReactNode;
  variant?: "default" | "destructive";
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

export function EmergencyDecisionActions({
  requestId,
  memberName,
  amount,
  actorAccessRoleKey,
  adminApproved,
  treasurerApproved,
  approvedAmount
}: {
  requestId: string;
  memberName: string;
  amount: number;
  actorAccessRoleKey: string;
  adminApproved: boolean;
  treasurerApproved: boolean;
  approvedAmount?: number | null;
}) {
  const amountRef = useRef<HTMLInputElement>(null);
  const [approveState, approveAction] = useFormState(approveEmergencyRequestAction, initialState);
  const [rejectState, rejectAction] = useFormState(rejectEmergencyRequestAction, initialState);
  const actorApprovalRole = getDualApprovalActor(actorAccessRoleKey);
  const actorLabel = actorApprovalRole === "ADMIN" ? "Admin" : actorApprovalRole === "MANAGER" ? "Manager" : "Reviewer";
  const alreadyApproved = actorApprovalRole === "ADMIN" ? adminApproved : actorApprovalRole === "MANAGER" ? treasurerApproved : false;
  const secondApproval = actorApprovalRole === "ADMIN" ? treasurerApproved : adminApproved;
  const defaultAmount = approvedAmount ?? amount;

  useEffect(() => {
    if (approveState.error) showToast({ type: "error", message: approveState.error });
    if (approveState.message) showToast({ type: "success", message: approveState.message });
  }, [approveState]);

  useEffect(() => {
    if (rejectState.error) showToast({ type: "error", message: rejectState.error });
    if (rejectState.message) showToast({ type: "success", message: rejectState.message });
  }, [rejectState]);

  return (
    <div className="flex flex-wrap gap-2">
        <form action={approveAction}>
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="status" value="APPROVED" />
          <input ref={amountRef} type="hidden" name="disbursementAmount" value={defaultAmount} />
          <DecisionButton
            disabled={alreadyApproved || !actorApprovalRole}
            onClick={(event) => {
              if (alreadyApproved || !actorApprovalRole) {
                event.preventDefault();
                return;
              }

              const enteredAmount = window.prompt(
                secondApproval
                  ? `Confirm the amount to disburse to ${memberName}.`
                  : `Enter the amount to approve for ${memberName}.`,
                String(defaultAmount)
              );

              if (enteredAmount === null) {
                event.preventDefault();
                return;
              }

              const numericAmount = Number(enteredAmount);
              if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
                event.preventDefault();
                window.alert("Enter a valid disbursement amount greater than 0.");
                return;
              }

              if (amountRef.current) {
                amountRef.current.value = String(numericAmount);
              }

              const ok = window.confirm(
                secondApproval
                  ? `${actorLabel} approval will disburse ${formatMoney(numericAmount)} to ${memberName} and record it as a withdrawal. Continue?`
                  : `${actorLabel} approval will record ${formatMoney(numericAmount)} for ${memberName}. The request will be disbursed after the other approver confirms. Continue?`
              );

              if (!ok) {
                event.preventDefault();
              }
            }}
          >
            {alreadyApproved ? "Approved" : secondApproval ? "Approve & Disburse" : "Approve"}
          </DecisionButton>
        </form>
        <form action={rejectAction}>
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="status" value="REJECTED" />
          <DecisionButton variant="destructive" disabled={alreadyApproved || !actorApprovalRole}>Reject</DecisionButton>
        </form>
    </div>
  );
}
