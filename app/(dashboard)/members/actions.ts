"use server";

import bcrypt from "bcryptjs";
import { MemberStatus, Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/rbac";
import { createMemberSchema } from "@/lib/validators/account";
import { revalidatePath } from "next/cache";

export async function createMemberAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) throw new Error("Unauthorized");

  const parsed = createMemberSchema.parse({
    name: String(formData.get("name") || ""),
    username: String(formData.get("username") || ""),
    email: String(formData.get("email") || ""),
    status: String(formData.get("status") || ""),
    temporaryPin: String(formData.get("temporaryPin") || ""),
    confirmTemporaryPin: String(formData.get("confirmTemporaryPin") || "")
  });

  const username = parsed.username.trim().toLowerCase();
  const email = parsed.email.trim().toLowerCase();

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email }
      ]
    },
    select: { id: true, username: true, email: true }
  });

  if (existing?.username === username) throw new Error("Username already exists");
  if (existing?.email === email) throw new Error("Email already exists");

  await prisma.user.create({
    data: {
      name: parsed.name.trim(),
      username,
      email,
      passwordHash: await bcrypt.hash(parsed.temporaryPin, 12),
      role: Role.MEMBER,
      status: parsed.status as MemberStatus
    }
  });

  revalidatePath("/members");
  revalidatePath("/account");
  revalidatePath("/dashboard");
  revalidatePath("/contributions");
  revalidatePath("/withdrawals");
  revalidatePath("/emergency-requests");
}
