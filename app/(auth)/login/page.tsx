import Image from "next/image";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { loginAction } from "./actions";
import { APP_FULL_NAME } from "@/lib/settings";
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
    <main className="grid min-h-screen place-items-center bg-hero px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="grid w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft lg:max-w-6xl lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden bg-slate-950 px-8 py-10 text-slate-100 lg:block lg:px-12 lg:py-12">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">RPIC Community</div>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight xl:text-5xl">{APP_FULL_NAME}</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 xl:text-base">A modern welfare, emergency savings, and financial administration platform for the RPIC Community. Contributions, withdrawals, emergency support, protected documents, and account management are handled in one secure internal system.</p>
          <div className="mt-8 space-y-4 text-sm text-slate-300 xl:text-base">
            <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-cyan-300" />Secure role-based access and protected financial workflows</div>
            <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-cyan-300" />Purpose-built for RPIC Community member operations</div>
          </div>
        </section>
        <section className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-6 sm:px-8 sm:py-7 lg:max-w-none lg:px-12 lg:py-12">
          <div className="mb-5 lg:mb-6">
            <div className="mb-2.5 flex items-center gap-3">
              <Image
                src="/branding/rpic-logo.svg"
                alt="RPIC Community logo"
                width={72}
                height={72}
                className="h-12 w-12 shrink-0 rounded-full border border-slate-200 bg-white shadow-sm"
              />
              <div className="min-w-0">
                <p className="text-xl font-semibold leading-6 text-slate-950">RPIC Community Members</p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-500">Use your username or email to access the RPIC Community workspace.</p>
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
            <SubmitButton label="Sign in" pendingLabel="Signing in..." className="w-full sm:w-auto" />
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-500">
              Demo admin: <strong>admin</strong> / <strong>Admin@123</strong><br />
              Demo treasurer: <strong>treasurer</strong> / <strong>Admin@123</strong><br />
              Demo member: <strong>alice</strong> / <strong>Member@123</strong>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
