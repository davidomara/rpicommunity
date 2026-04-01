"use server";

import { randomUUID } from "node:crypto";
import { addHours } from "date-fns";
import { prisma } from "@/lib/db";
import { requestPasswordResetSchema } from "@/lib/validators/auth";

export async function requestResetAction(formData: FormData) {
  const parsed = requestPasswordResetSchema.parse({
    identifier: String(formData.get("identifier") || "")
  });

  const identifier = parsed.identifier.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] }
  });

  if (!user) return;

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, ""),
      expiresAt: addHours(new Date(), 1)
    }
  });
}
