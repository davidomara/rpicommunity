import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canManageFinance } from "@/lib/rbac";
import { getWithdrawalContext } from "@/lib/queries";
import { WithdrawalsAdminClient } from "@/components/admin/withdrawals-admin-client";

export default async function WithdrawalsPage() {
  const session = await auth();
  if (!session?.user || !canManageFinance(session.user.role)) redirect("/dashboard");

  const { members, rows } = await getWithdrawalContext();

  return <WithdrawalsAdminClient members={members} rows={rows.map((row) => ({ ...row, amount: Number(row.amount) }))} />;
}
