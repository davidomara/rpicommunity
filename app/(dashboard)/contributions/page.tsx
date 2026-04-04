import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canManageFinance } from "@/lib/rbac";
import { getContributionContext } from "@/lib/queries";
import { ContributionsAdminClient } from "@/components/admin/contributions-admin-client";

export default async function ContributionsPage() {
  const session = await auth();
  if (!session?.user || !canManageFinance(session.user.role)) redirect("/dashboard");

  const { members, rows } = await getContributionContext();

  return <ContributionsAdminClient members={members} rows={rows.map((row) => ({ ...row, amount: Number(row.amount) }))} />;
}
