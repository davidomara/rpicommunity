import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getWithdrawalContext } from "@/lib/queries";
import { WithdrawalsAdminClient } from "@/components/admin/withdrawals-admin-client";
import { getUserAuthorization, hasPermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WithdrawalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const authorization = await getUserAuthorization(session.user.id);
  if (!authorization || !hasPermission(authorization, "withdrawals.view")) redirect("/dashboard");
  const canCreate = hasPermission(authorization, "withdrawals.create");

  const { members, rows } = await getWithdrawalContext();

  return <WithdrawalsAdminClient members={members} rows={rows.map((row) => ({ ...row, amount: Number(row.amount) }))} canCreate={canCreate} />;
}
