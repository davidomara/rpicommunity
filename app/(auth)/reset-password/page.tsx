import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-soft sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-950">Choose a new password</h1>
        <ResetPasswordForm token={searchParams.token || ""} />
      </div>
    </main>
  );
}
