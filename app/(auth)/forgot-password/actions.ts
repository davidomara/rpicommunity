"use server";

import { prisma } from "@/lib/db";
import { requestPasswordResetSchema } from "@/lib/validators/auth";
import {
  getPasswordResetDeliveryErrorMessage,
  getPasswordResetEmailConfigError,
  isPasswordResetEmailConfigured,
  issuePasswordResetToken,
  revokeOtherPasswordResetTokens,
  revokePasswordResetToken,
  sendPasswordResetEmail
} from "@/lib/password-reset";

export type RequestResetFormState = {
  success: boolean;
  error: string;
  message: string;
};

export async function requestResetAction(
  _: RequestResetFormState,
  formData: FormData
): Promise<RequestResetFormState> {
  if (!isPasswordResetEmailConfigured()) {
    return {
      success: false,
      error: getPasswordResetEmailConfigError(),
      message: ""
    };
  }

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
      message: "If the account exists, a password reset link has been sent."
    };
  }

  const resetToken = await issuePasswordResetToken(user.id);

  try {
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl: resetToken.resetUrl,
      expiresAt: resetToken.expiresAt
    });
    await revokeOtherPasswordResetTokens(user.id, resetToken.tokenHash);
  } catch (error) {
    await revokePasswordResetToken(resetToken.tokenHash);
    console.error("Password reset email delivery failed", error);

    return {
      success: false,
      error: getPasswordResetDeliveryErrorMessage(error),
      message: ""
    };
  }

  return {
    success: true,
    error: "",
    message: "If the account exists, a password reset link has been sent."
  };
}
