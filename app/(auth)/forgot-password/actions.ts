"use server";

import { randomUUID } from "node:crypto";
import { addHours } from "date-fns";
import { prisma } from "@/lib/db";
import { requestPasswordResetSchema } from "@/lib/validators/auth";

export type RequestResetFormState = {
  success: boolean;
  error: string;
  message: string;
};

export async function requestResetAction(
  _: RequestResetFormState,
  formData: FormData
): Promise<RequestResetFormState> {
  const parsed = requestPasswordResetSchema.safeParse({
    identifier: String(formData.get("identifier") || "")
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Enter a valid username or email",
      message: ""
    };
  }

  const identifier = parsed.data.identifier.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] }
  });

  if (!user) {
    return {
      success: true,
      error: "",
      message: "If the account exists, a reset token has been generated for internal handling."
    };
  }

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, ""),
      expiresAt: addHours(new Date(), 1)
    }
  });

  return {
    success: true,
    error: "",
    message: "Reset token generated successfully for internal handling."
  };
}
