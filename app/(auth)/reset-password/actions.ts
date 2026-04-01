"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function resetPasswordAction(formData: FormData) {
  const parsed = resetPasswordSchema.parse({
    token: String(formData.get("token") || ""),
    password: String(formData.get("password") || ""),
    confirmPassword: String(formData.get("confirmPassword") || "")
  });

  const token = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.token },
    include: { user: true }
  });

  if (!token || token.usedAt || token.expiresAt < new Date()) {
    throw new Error("Reset token is invalid or expired");
  }

  await prisma.user.update({
    where: { id: token.userId },
    data: { passwordHash: await bcrypt.hash(parsed.password, 12) }
  });

  await prisma.passwordResetToken.update({
    where: { id: token.id },
    data: { usedAt: new Date() }
  });
}
