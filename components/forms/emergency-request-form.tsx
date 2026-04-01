import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmergencyRequestForm({ action, memberId, isAdmin, members }: {
  action: (formData: FormData) => Promise<void>;
  memberId: string;
  isAdmin: boolean;
  members: Array<{ id: string; name: string }>;
}) {
  return (
    <Card>
      <CardHeader><CardTitle>Submit Emergency Request</CardTitle></CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          {isAdmin ? (
            <div className="grid gap-2">
              <Label htmlFor="memberId">Member</Label>
              <select id="memberId" name="memberId" defaultValue={memberId} required className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                <option value="">Select member</option>
                {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </div>
          ) : (
            <input type="hidden" name="memberId" value={memberId} />
          )}
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" min="1" step="0.01" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" name="reason" required />
          </div>
          <SubmitButton label="Submit Request" pendingLabel="Submitting..." />
        </form>
      </CardContent>
    </Card>
  );
}
