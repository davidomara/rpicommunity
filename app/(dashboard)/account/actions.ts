"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ROLE } from "@/lib/domain-types";
import { getCurrentUserAuthorization, hasPermission } from "@/lib/rbac";
import { resetMemberPinSchema, updateEmailSchema, updateMemberEmailSchema, updateMemberStatusThresholdsSchema, updatePasswordSchema } from "@/lib/validators/account";
import { revalidatePath } from "next/cache";

export type AccountFormState = {
  success: boolean;
  error: string;
  message: string;
};

async function assertMemberTarget(memberId: string) {
  const member = await prisma.user.findUnique({
    where: { id: memberId },
    select: { id: true, role: true }
  });

  if (!member || member.role !== ROLE.MEMBER) {
    return false;
  }

  return true;
}

export async function updateEmailAction(_: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized", message: "" };

  const parsed = updateEmailSchema.safeParse({ email: String(formData.get("email") || "") });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid email", message: "" };
  }
  await prisma.user.update({ where: { id: session.user.id }, data: { email: parsed.data.email.toLowerCase() } });
  revalidatePath("/account");
  return { success: true, error: "", message: "Email updated successfully." };
}

export async function updatePasswordAction(_: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized", message: "" };

  const parsed = updatePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") || ""),
    newPassword: String(formData.get("newPassword") || ""),
    confirmPassword: String(formData.get("confirmPassword") || "")
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid password details", message: "" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { success: false, error: "User not found", message: "" };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { success: false, error: "Current password is incorrect", message: "" };

  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) } });
  revalidatePath("/account");
  return { success: true, error: "", message: "Password changed successfully." };
}

export async function updateMemberEmailAction(_: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const authorization = await getCurrentUserAuthorization();
  if (!authorization || !hasPermission(authorization, "users.manage")) return { success: false, error: "Unauthorized", message: "" };

  const parsed = updateMemberEmailSchema.safeParse({
    memberId: String(formData.get("memberId") || ""),
    email: String(formData.get("email") || "")
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid member email details", message: "" };
  }

  const exists = await assertMemberTarget(parsed.data.memberId);
  if (!exists) return { success: false, error: "Member not found", message: "" };
  await prisma.user.update({
    where: { id: parsed.data.memberId },
    data: { email: parsed.data.email.toLowerCase() }
  });

  revalidatePath("/account");
  revalidatePath("/members");
  return { success: true, error: "", message: "Member email updated successfully." };
}

export async function resetMemberPinAction(_: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const authorization = await getCurrentUserAuthorization();
  if (!authorization || !hasPermission(authorization, "users.manage")) return { success: false, error: "Unauthorized", message: "" };

  const parsed = resetMemberPinSchema.safeParse({
    memberId: String(formData.get("memberId") || ""),
    newPin: String(formData.get("newPin") || ""),
    confirmPin: String(formData.get("confirmPin") || "")
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid PIN details", message: "" };
  }

  const exists = await assertMemberTarget(parsed.data.memberId);
  if (!exists) return { success: false, error: "Member not found", message: "" };
  await prisma.user.update({
    where: { id: parsed.data.memberId },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPin, 12) }
  });

  revalidatePath("/account");
  return { success: true, error: "", message: "Member PIN reset successfully." };
}

export async function updateMemberStatusThresholdsAction(_: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const authorization = await getCurrentUserAuthorization();
  if (!authorization || !hasPermission(authorization, "settings.manage")) return { success: false, error: "Unauthorized", message: "" };

  const parsed = updateMemberStatusThresholdsSchema.safeParse({
    warningAfterMonths: formData.get("warningAfterMonths"),
    closeAfterMonths: formData.get("closeAfterMonths")
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid status thresholds", message: "" };
  }

  await prisma.communitySettings.upsert({
    where: { id: "community" },
    update: {
      warningAfterMonths: parsed.data.warningAfterMonths,
      closeAfterMonths: parsed.data.closeAfterMonths
    },
    create: {
      id: "community",
      warningAfterMonths: parsed.data.warningAfterMonths,
      closeAfterMonths: parsed.data.closeAfterMonths
    }
  });

  revalidatePath("/account");
  revalidatePath("/dashboard");
  revalidatePath("/members");
  return { success: true, error: "", message: "Member status automation rules saved." };
}
