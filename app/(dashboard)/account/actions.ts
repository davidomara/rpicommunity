"use server";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageMembers } from "@/lib/rbac";
import { resetMemberPinSchema, updateEmailSchema, updateMemberEmailSchema, updateMemberStatusThresholdsSchema, updatePasswordSchema } from "@/lib/validators/account";
import { revalidatePath } from "next/cache";

async function assertMemberTarget(memberId: string) {
  const member = await prisma.user.findUnique({
    where: { id: memberId },
    select: { id: true, role: true }
  });

  if (!member || member.role !== Role.MEMBER) {
    throw new Error("Member not found");
  }
}

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

export async function updateMemberEmailAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageMembers(session.user.role)) throw new Error("Unauthorized");

  const parsed = updateMemberEmailSchema.parse({
    memberId: String(formData.get("memberId") || ""),
    email: String(formData.get("email") || "")
  });

  await assertMemberTarget(parsed.memberId);
  await prisma.user.update({
    where: { id: parsed.memberId },
    data: { email: parsed.email.toLowerCase() }
  });

  revalidatePath("/account");
  revalidatePath("/members");
}

export async function resetMemberPinAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageMembers(session.user.role)) throw new Error("Unauthorized");

  const parsed = resetMemberPinSchema.parse({
    memberId: String(formData.get("memberId") || ""),
    newPin: String(formData.get("newPin") || ""),
    confirmPin: String(formData.get("confirmPin") || "")
  });

  await assertMemberTarget(parsed.memberId);
  await prisma.user.update({
    where: { id: parsed.memberId },
    data: { passwordHash: await bcrypt.hash(parsed.newPin, 12) }
  });

  revalidatePath("/account");
}

export async function updateMemberStatusThresholdsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageMembers(session.user.role)) throw new Error("Unauthorized");

  const parsed = updateMemberStatusThresholdsSchema.parse({
    warningAfterMonths: formData.get("warningAfterMonths"),
    closeAfterMonths: formData.get("closeAfterMonths")
  });

  await prisma.communitySettings.upsert({
    where: { id: "community" },
    update: {
      warningAfterMonths: parsed.warningAfterMonths,
      closeAfterMonths: parsed.closeAfterMonths
    },
    create: {
      id: "community",
      warningAfterMonths: parsed.warningAfterMonths,
      closeAfterMonths: parsed.closeAfterMonths
    }
  });

  revalidatePath("/account");
  revalidatePath("/dashboard");
  revalidatePath("/members");
}
