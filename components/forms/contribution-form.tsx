import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayISODate } from "@/lib/utils";

export function ContributionForm({ members, action }: { members: Array<{ id: string; name: string; username: string }>; action: (formData: FormData) => Promise<void> }) {
  return (
    <Card>
      <CardHeader><CardTitle>Add Contribution</CardTitle></CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="memberId">Member</Label>
            <select id="memberId" name="memberId" required className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
              <option value="">Select member</option>
              {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" min="1" step="0.01" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contributionDate">Contribution Date</Label>
            <Input id="contributionDate" name="contributionDate" type="date" defaultValue={getTodayISODate()} max={getTodayISODate()} required />
          </div>
          <div className="md:col-span-2">
            <SubmitButton label="Save Contribution" pendingLabel="Saving..." />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
