import { auth } from "@/auth";
import { appRoute } from "@/lib/app-path";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  redirect(appRoute(session?.user ? "/dashboard" : "/login"));
}
