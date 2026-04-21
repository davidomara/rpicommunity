import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { ContributionApprovalStatus } from "@/lib/domain-types";
import { getContributionContextForAuthorization } from "@/lib/queries";
import { getUserAuthorization, hasPermission } from "@/lib/rbac";
import { ContributionsAdminClient } from "@/components/admin/contributions-admin-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContributionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const authorization = await getUserAuthorization(session.user.id);
  if (!authorization || !hasPermission(authorization, "contributions.view")) redirect("/dashboard");
  const canCreate = hasPermission(authorization, "contributions.create");

  const { members, rows, staffView } = await getContributionContextForAuthorization(authorization);

  return (
    <ContributionsAdminClient
      members={members}
      rows={rows.map((row) => ({
        ...row,
        amount: Number(row.amount),
        approvalStatus: row.approvalStatus as ContributionApprovalStatus
      }))}
      staffView={staffView}
      canCreate={canCreate}
    />
  );
}
