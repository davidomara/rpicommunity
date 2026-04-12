"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canReviewContributionNotifications } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { ContributionApprovalStatus } from "@prisma/client";

async function revalidateContributionSurfaces() {
  revalidatePath("/dashboard");
  revalidatePath("/members");
  revalidatePath("/contributions");
  revalidatePath("/notifications");
}

export async function approveContributionNotificationAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canReviewContributionNotifications(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const contributionId = String(formData.get("contributionId") || "");
  if (!contributionId) throw new Error("Contribution request was not found");

  await prisma.$transaction(async (tx) => {
    const contribution = await tx.contribution.findFirst({
      where: { id: contributionId, approvalStatus: ContributionApprovalStatus.PENDING }
    });

    if (!contribution) return;

    await tx.contribution.update({
      where: { id: contribution.id },
      data: {
        approvalStatus: ContributionApprovalStatus.APPROVED,
        approvedAt: new Date(),
        approvedById: session.user.id,
        rejectedAt: null,
        rejectedById: null
      }
    });

    await tx.transaction.create({
      data: {
        memberId: contribution.memberId,
        type: "CONTRIBUTION",
        amount: contribution.amount,
        eventDate: contribution.contributionDate,
        actorId: session.user.id,
        notes: "Contribution approved from member submission"
      }
    });
  });

  await revalidateContributionSurfaces();
}

export async function rejectContributionNotificationAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canReviewContributionNotifications(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const contributionId = String(formData.get("contributionId") || "");
  if (!contributionId) throw new Error("Contribution request was not found");

  await prisma.contribution.updateMany({
    where: { id: contributionId, approvalStatus: ContributionApprovalStatus.PENDING },
    data: {
      approvalStatus: ContributionApprovalStatus.REJECTED,
      rejectedAt: new Date(),
      rejectedById: session.user.id
    }
  });

  await revalidateContributionSurfaces();
}
