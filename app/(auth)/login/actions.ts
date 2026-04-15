"use server";

import { signIn } from "@/auth";
import { withBasePath } from "@/lib/app-path";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") || "");
  const password = String(formData.get("password") || "");

  try {
    await signIn("credentials", {
      identifier,
      password,
      redirectTo: withBasePath("/dashboard")
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "type" in error &&
      typeof (error as { type: unknown }).type === "string"
    ) {
      redirect(withBasePath(`/login?error=${(error as { type: string }).type}`));
    }

    throw error;
  }
}
