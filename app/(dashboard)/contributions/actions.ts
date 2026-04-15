"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CONTRIBUTION_APPROVAL_STATUS } from "@/lib/domain-types";
import { canAccessContributions, canManageFinance } from "@/lib/rbac";
import { contributionSchema } from "@/lib/validators/finance";
import { revalidatePath } from "next/cache";

export type ContributionFormState = {
  success: boolean;
  error: string;
  message: string;
};

export async function createContributionAction(_: ContributionFormState, formData: FormData): Promise<ContributionFormState> {
  const session = await auth();
  if (!session?.user || !canAccessContributions(session.user.role)) {
    return {
      success: false,
      error: "Unauthorized",
      message: ""
    };
  }

  const requestedMemberId = String(formData.get("memberId") || "");
  const memberId = canManageFinance(session.user.role) ? requestedMemberId : session.user.id;

  const parsed = contributionSchema.safeParse({
    memberId,
    amount: formData.get("amount"),
    contributionDate: String(formData.get("contributionDate") || "")
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid contribution details",
      message: ""
    };
  }

  const member = await prisma.user.findUnique({
    where: { id: parsed.data.memberId },
    select: { id: true }
  });
  if (!member) {
    return {
      success: false,
      error: "Selected member was not found",
      message: ""
    };
  }

  const contributionDate = new Date(`${parsed.data.contributionDate}T00:00:00.000Z`);

  if (canManageFinance(session.user.role)) {
    const contribution = await prisma.contribution.create({
      data: {
        memberId: parsed.data.memberId,
        amount: parsed.data.amount,
        contributionDate,
        approvalStatus: CONTRIBUTION_APPROVAL_STATUS.APPROVED,
        createdById: session.user.id,
        approvedAt: new Date(),
        approvedById: session.user.id
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
    revalidatePath("/notifications");

    return {
      success: true,
      error: "",
      message: "Contribution saved successfully."
    };
  }

  await prisma.contribution.create({
    data: {
      memberId: session.user.id,
      amount: parsed.data.amount,
      contributionDate,
      approvalStatus: CONTRIBUTION_APPROVAL_STATUS.PENDING,
      createdById: session.user.id
    }
  });

  revalidatePath("/contributions");
  revalidatePath("/notifications");

  return {
    success: true,
    error: "",
    message: "Contribution submitted for admin approval."
  };
}
