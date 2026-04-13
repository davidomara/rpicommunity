"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  approveEmergencyRequestAction,
  rejectEmergencyRequestAction,
  type EmergencyDecisionFormState
} from "@/app/(dashboard)/emergency-requests/actions";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import { Role } from "@prisma/client";

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
  actorRole,
  adminApproved,
  treasurerApproved,
  approvedAmount
}: {
  requestId: string;
  memberName: string;
  amount: number;
  actorRole: Role;
  adminApproved: boolean;
  treasurerApproved: boolean;
  approvedAmount?: number | null;
}) {
  const amountRef = useRef<HTMLInputElement>(null);
  const [approveState, approveAction] = useFormState(approveEmergencyRequestAction, initialState);
  const [rejectState, rejectAction] = useFormState(rejectEmergencyRequestAction, initialState);
  const alreadyApproved = actorRole === "ADMIN" ? adminApproved : actorRole === "TREASURER" ? treasurerApproved : false;
  const secondApproval = actorRole === "ADMIN" ? treasurerApproved : adminApproved;
  const defaultAmount = approvedAmount ?? amount;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <form action={approveAction}>
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="status" value="APPROVED" />
          <input ref={amountRef} type="hidden" name="disbursementAmount" value={defaultAmount} />
          <DecisionButton
            disabled={alreadyApproved}
            onClick={(event) => {
              if (alreadyApproved) {
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
                  ? `${actorRole === "ADMIN" ? "Admin" : "Treasurer"} approval will disburse ${formatMoney(numericAmount)} to ${memberName} and record it as a withdrawal. Continue?`
                  : `${actorRole === "ADMIN" ? "Admin" : "Treasurer"} approval will record ${formatMoney(numericAmount)} for ${memberName}. The request will be disbursed after the other approver confirms. Continue?`
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
          <DecisionButton variant="destructive" disabled={alreadyApproved}>Reject</DecisionButton>
        </form>
      </div>
      <FormMessage type="error" message={approveState.error || rejectState.error} className="max-w-md" />
      <FormMessage type="success" message={approveState.message || rejectState.message} className="max-w-md" />
    </div>
  );
}
