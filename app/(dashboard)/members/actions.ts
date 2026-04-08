"use server";

import bcrypt from "bcryptjs";
import { MemberStatus, Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageMembers } from "@/lib/rbac";
import { createMemberSchema } from "@/lib/validators/account";
import { revalidatePath } from "next/cache";

export type CreateMemberFormState = {
  success: boolean;
  message: string;
  error: string;
};

export async function createMemberAction(_: CreateMemberFormState, formData: FormData): Promise<CreateMemberFormState> {
  const session = await auth();
  if (!session?.user || !canManageMembers(session.user.role)) {
    return {
      success: false,
      message: "",
      error: "Unauthorized"
    };
  }

  const parsed = createMemberSchema.safeParse({
    name: String(formData.get("name") || ""),
    username: String(formData.get("username") || ""),
    email: String(formData.get("email") || ""),
    status: String(formData.get("status") || ""),
    temporaryPin: String(formData.get("temporaryPin") || ""),
    confirmTemporaryPin: String(formData.get("confirmTemporaryPin") || "")
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "",
      error: parsed.error.issues[0]?.message || "Invalid member details"
    };
  }

  const username = parsed.data.username.trim().toLowerCase();
  const email = parsed.data.email.trim().toLowerCase();

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email }
      ]
    },
    select: { id: true, username: true, email: true }
  });

  if (existing?.username === username) {
    return {
      success: false,
      message: "",
      error: "Username already exists"
    };
  }
  if (existing?.email === email) {
    return {
      success: false,
      message: "",
      error: "Email already exists"
    };
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      username,
      email,
      passwordHash: await bcrypt.hash(parsed.data.temporaryPin, 12),
      role: Role.MEMBER,
      status: parsed.data.status as MemberStatus
    }
  });

  revalidatePath("/members");
  revalidatePath("/account");
  revalidatePath("/dashboard");
  revalidatePath("/contributions");
  revalidatePath("/withdrawals");
  revalidatePath("/emergency-requests");

  return {
    success: true,
    message: "Member created successfully.",
    error: ""
  };
}
