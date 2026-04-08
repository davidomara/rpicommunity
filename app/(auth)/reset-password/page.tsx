import { resetPasswordAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-soft sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-950">Choose a new password</h1>
        <form action={resetPasswordAction} className="mt-6 space-y-4">
          <input type="hidden" name="token" value={searchParams.token || ""} />
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
          </div>
          <SubmitButton label="Reset password" pendingLabel="Updating..." className="w-full sm:w-auto" />
        </form>
      </div>
    </main>
  );
}
