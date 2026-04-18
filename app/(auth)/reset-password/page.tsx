import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { BrowserSessionMarker } from "@/components/auth/browser-session-marker";
import { getValidPasswordResetToken } from "@/lib/password-reset";

export default async function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token?.trim() || "";
  const validToken = token ? await getValidPasswordResetToken(token) : null;

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-12">
      <BrowserSessionMarker />
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-soft sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-950">
          {validToken ? "Choose a new password" : "Reset link unavailable"}
        </h1>
        {validToken ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-slate-500">
              This password reset link is invalid or expired. Request a new link to continue.
            </p>
            <Link href="/forgot-password" className="inline-flex text-sm font-medium text-cyan-700 hover:text-cyan-800">
              Request a new reset link
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
