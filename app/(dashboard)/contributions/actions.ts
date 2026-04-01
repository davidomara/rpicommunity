"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageFinance } from "@/lib/rbac";
import { contributionSchema } from "@/lib/validators/finance";
import { revalidatePath } from "next/cache";

export type ContributionFormState = {
  success: boolean;
  error: string;
};

export async function createContributionAction(_: ContributionFormState, formData: FormData): Promise<ContributionFormState> {
  const session = await auth();
  if (!session?.user || !canManageFinance(session.user.role)) {
    return {
      success: false,
      error: "Unauthorized"
    };
  }

  const parsed = contributionSchema.safeParse({
    memberId: String(formData.get("memberId") || ""),
    amount: formData.get("amount"),
    contributionDate: String(formData.get("contributionDate") || "")
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid contribution details"
    };
  }

  const contribution = await prisma.contribution.create({
    data: {
      memberId: parsed.data.memberId,
      amount: parsed.data.amount,
      contributionDate: new Date(`${parsed.data.contributionDate}T00:00:00.000Z`),
      createdById: session.user.id
    }
  });

  await prisma.transaction.create({
    data: {
      memberId: parsed.data.memberId,
      type: "CONTRIBUTION",
      amount: parsed.data.amount,
      eventDate: contribution.contributionDate,
      actorId: session.user.id,
      notes: "Contribution recorded"
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/members");
  revalidatePath("/contributions");

  return {
    success: true,
    error: ""
  };
}
