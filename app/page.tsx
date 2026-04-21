import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canAccessSettings, getUserAuthorization, hasPermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const authorization = await getUserAuthorization(session.user.id);
  if (!authorization) {
    redirect("/login");
  }

  if (hasPermission(authorization, "dashboard.view")) {
    redirect("/dashboard");
  }

  if (canAccessSettings(authorization)) {
    redirect("/settings");
  }

  redirect("/account");
}
