import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Building2, ShieldCheck } from "lucide-react";
import { loginAction } from "./actions";
import { APP_FULL_NAME, APP_SUBTITLE } from "@/lib/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";

const loginErrors: Record<string, string> = {
  CredentialsSignin: "Invalid username/email or password.",
  CallbackRouteError: "Sign-in could not be completed. Check the database and Prisma setup, then try again."
};

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  const params = await searchParams;
  const errorMessage = params?.error ? loginErrors[params.error] || "Sign-in failed. Please try again." : "";

  return (
    <main className="grid min-h-screen place-items-center bg-hero px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden bg-slate-950 px-8 py-12 text-slate-100 lg:block lg:px-10">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">Directorate of ICT</div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">{APP_FULL_NAME}</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">A modern welfare, emergency savings, and financial administration platform for the RPIC Community. Contributions, withdrawals, emergency support, protected documents, and account management are handled in one secure internal system.</p>
          <div className="mt-10 space-y-4 text-sm text-slate-300">
            <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-cyan-300" />Secure role-based access and protected financial workflows</div>
            <div className="flex items-center gap-3"><Building2 className="h-4 w-4 text-cyan-300" />Purpose-built for RPIC Community under the Directorate of ICT</div>
          </div>
        </section>
        <section className="px-8 py-12 lg:px-10">
          <div className="mb-8">
            <p className="text-sm font-medium text-cyan-700">{APP_SUBTITLE}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">Use your username or email to access the RPIC Community workspace.</p>
          </div>
          <form action={loginAction} className="space-y-5">
            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="identifier">Username or Email</Label>
              <Input id="identifier" name="identifier" autoComplete="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            <div className="flex items-center justify-between text-sm">
              <a href="/forgot-password" className="font-medium text-cyan-700 hover:text-cyan-800">Forgot password?</a>
            </div>
            <SubmitButton label="Sign in" pendingLabel="Signing in..." />
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              Demo admin: <strong>admin</strong> / <strong>Admin@123</strong><br />
              Demo member: <strong>alice</strong> / <strong>Member@123</strong>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
