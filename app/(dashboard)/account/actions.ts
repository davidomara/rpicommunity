"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { updateEmailSchema, updatePasswordSchema } from "@/lib/validators/account";
import { revalidatePath } from "next/cache";

export async function updateEmailAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = updateEmailSchema.parse({ email: String(formData.get("email") || "") });
  await prisma.user.update({ where: { id: session.user.id }, data: { email: parsed.email.toLowerCase() } });
  revalidatePath("/account");
}

export async function updatePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = updatePasswordSchema.parse({
    currentPassword: String(formData.get("currentPassword") || ""),
    newPassword: String(formData.get("newPassword") || ""),
    confirmPassword: String(formData.get("confirmPassword") || "")
  });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(parsed.currentPassword, user.passwordHash);
  if (!valid) throw new Error("Current password is incorrect");

  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: await bcrypt.hash(parsed.newPassword, 12) } });
  revalidatePath("/account");
}
