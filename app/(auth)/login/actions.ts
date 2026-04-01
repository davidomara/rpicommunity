"use server";

import { signIn } from "@/auth";

export async function loginAction(formData: FormData) {
  await signIn("credentials", {
    identifier: String(formData.get("identifier") || ""),
    password: String(formData.get("password") || ""),
    redirectTo: "/dashboard"
  });
}
