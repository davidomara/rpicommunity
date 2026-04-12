import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canAccessContributions } from "@/lib/rbac";
import { getContributionContextForRole } from "@/lib/queries";
import { ContributionsAdminClient } from "@/components/admin/contributions-admin-client";

export default async function ContributionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canAccessContributions(session.user.role)) redirect("/dashboard");

  const { members, rows, staffView } = await getContributionContextForRole(session.user.role, session.user.id);

  return (
    <ContributionsAdminClient
      members={members}
      rows={rows.map((row) => ({ ...row, amount: Number(row.amount) }))}
      staffView={staffView}
    />
  );
}
