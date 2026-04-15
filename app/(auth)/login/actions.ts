"use server";

import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") || "");
  const password = String(formData.get("password") || "");

  try {
    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false
    });

    if (typeof result === "string") {
      redirect("/dashboard");
    }

    redirect("/dashboard");
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "type" in error &&
      typeof (error as { type: unknown }).type === "string"
    ) {
      redirect(`/login?error=${(error as { type: string }).type}`);
    }

    throw error;
  }
}
