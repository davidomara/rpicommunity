"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageFinance } from "@/lib/rbac";
import { contributionSchema } from "@/lib/validators/finance";
import { revalidatePath } from "next/cache";

export async function createContributionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageFinance(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const parsed = contributionSchema.parse({
    memberId: String(formData.get("memberId") || ""),
    amount: formData.get("amount"),
    contributionDate: String(formData.get("contributionDate") || "")
  });

  const contribution = await prisma.contribution.create({
    data: {
      memberId: parsed.memberId,
      amount: parsed.amount,
      contributionDate: new Date(`${parsed.contributionDate}T00:00:00.000Z`),
      createdById: session.user.id
    }
  });

  await prisma.transaction.create({
    data: {
      memberId: parsed.memberId,
      type: "CONTRIBUTION",
      amount: parsed.amount,
      eventDate: contribution.contributionDate,
      actorId: session.user.id,
      notes: "Contribution recorded"
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/members");
  revalidatePath("/contributions");
}
