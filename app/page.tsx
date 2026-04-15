import { auth } from "@/auth";
import { withBasePath } from "@/lib/app-path";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  redirect(withBasePath(session?.user ? "/dashboard" : "/login"));
}
