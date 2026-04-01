"use client";

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
  return (
    <div className="flex gap-2">
      <form action={decideEmergencyRequestAction}>
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="status" value="APPROVED" />
        <Button
          size="sm"
          type="submit"
          onClick={(event) => {
            const ok = window.confirm(
              `Disburse ${formatMoney(amount)} to ${memberName} and record it as a withdrawal?`
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
