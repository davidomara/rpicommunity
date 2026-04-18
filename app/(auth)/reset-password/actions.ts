"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getValidPasswordResetToken } from "@/lib/password-reset";
import { resetPasswordSchema } from "@/lib/validators/auth";

export type ResetPasswordFormState = {
  success: boolean;
  error: string;
  message: string;
};

export async function resetPasswordAction(
  _: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: String(formData.get("token") || ""),
    password: String(formData.get("password") || ""),
    confirmPassword: String(formData.get("confirmPassword") || "")
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid password reset details",
      message: ""
    };
  }

  const token = await getValidPasswordResetToken(parsed.data.token);

  if (!token) {
    return {
      success: false,
      error: "Reset token is invalid or expired",
      message: ""
    };
  }

  await prisma.user.update({
    where: { id: token.userId },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) }
  });

  await prisma.passwordResetToken.updateMany({
    where: {
      userId: token.userId,
      usedAt: null
    },
    data: { usedAt: new Date() }
  });

  return {
    success: true,
    error: "",
    message: "Password reset successfully. You can now sign in."
  };
}
