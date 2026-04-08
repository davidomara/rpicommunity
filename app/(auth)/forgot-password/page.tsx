import { requestResetAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-soft sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-950">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-500">Enter your username or email. For the starter build, a reset token is generated in the database for internal admin handling.</p>
        <form action={requestResetAction} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Username or Email</Label>
            <Input id="identifier" name="identifier" required />
          </div>
          <SubmitButton label="Generate reset token" pendingLabel="Generating..." className="w-full sm:w-auto" />
        </form>
      </div>
    </main>
  );
}
