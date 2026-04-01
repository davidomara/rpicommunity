"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import { decideEmergencyRequestAction } from "@/app/(dashboard)/emergency-requests/actions";

export function EmergencyDecisionActions({
  requestId,
  memberName,
  amount
}: {
  requestId: string;
  memberName: string;
  amount: number;
}) {
  const amountRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-2">
      <form action={decideEmergencyRequestAction}>
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="status" value="APPROVED" />
        <input ref={amountRef} type="hidden" name="disbursementAmount" value={amount} />
        <Button
          size="sm"
          type="submit"
          onClick={(event) => {
            const enteredAmount = window.prompt(
              `Enter the amount to disburse to ${memberName}.`,
              String(amount)
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
              `Disburse ${formatMoney(numericAmount)} to ${memberName} and record it as a withdrawal?`
            );

            if (!ok) {
              event.preventDefault();
            }
          }}
        >
          Approve & Disburse
        </Button>
      </form>
      <form action={decideEmergencyRequestAction}>
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="status" value="REJECTED" />
        <Button size="sm" variant="destructive">Reject</Button>
      </form>
    </div>
  );
}
