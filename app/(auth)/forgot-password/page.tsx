import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { BrowserSessionMarker } from "@/components/auth/browser-session-marker";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-12">
      <BrowserSessionMarker />
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-soft sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-950">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your username or email and we will send you a password reset link.
        </p>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
