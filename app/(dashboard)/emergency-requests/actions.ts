"use server";

import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/rbac";
import { emergencyRequestSchema, emergencyDecisionSchema } from "@/lib/validators/finance";
import { revalidatePath } from "next/cache";

export type EmergencyRequestFormState = {
  success: boolean;
  error: string;
};

export async function createEmergencyRequestAction(
  _: EmergencyRequestFormState,
  formData: FormData
): Promise<EmergencyRequestFormState> {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized"
    };
  }

  const parsed = emergencyRequestSchema.safeParse({
    memberId: String(formData.get("memberId") || session.user.id),
    amount: formData.get("amount"),
    reason: String(formData.get("reason") || "")
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid emergency request"
    };
  }

  const memberId = isAdmin(session.user.role) ? parsed.data.memberId : session.user.id;

  await prisma.emergencyRequest.create({
    data: {
      memberId,
      amount: parsed.data.amount,
      reason: parsed.data.reason
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/emergency-requests");

  return {
    success: true,
    error: ""
  };
}

export async function decideEmergencyRequestAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) throw new Error("Unauthorized");

  const parsed = emergencyDecisionSchema.parse({
    requestId: String(formData.get("requestId") || ""),
    status: String(formData.get("status") || "")
  });

  await prisma.$transaction(async (tx) => {
    const request = await tx.emergencyRequest.findUnique({
      where: { id: parsed.requestId },
      select: {
        id: true,
        memberId: true,
        amount: true,
        reason: true,
        status: true
      }
    });

    if (!request) throw new Error("Emergency request not found");
    if (request.status !== "PENDING") throw new Error("Emergency request has already been processed");

    const updated = await tx.emergencyRequest.updateMany({
      where: {
        id: parsed.requestId,
        status: "PENDING"
      },
      data: {
        status: parsed.status,
        decisionDate: new Date(),
        decidedById: session.user.id
      }
    });

    if (!updated.count) throw new Error("Emergency request has already been processed");

    if (parsed.status === "APPROVED") {
      const withdrawal = await tx.withdrawal.create({
        data: {
          memberId: request.memberId,
          amount: request.amount,
          reason: `Emergency disbursement: ${request.reason}`,
          withdrawalDate: new Date(),
          createdById: session.user.id
        }
      });

      await tx.transaction.create({
        data: {
          memberId: request.memberId,
          type: "WITHDRAWAL",
          amount: request.amount as Prisma.Decimal,
          eventDate: withdrawal.withdrawalDate,
          actorId: session.user.id,
          notes: `Emergency request approved and disbursed`
        }
      });
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/emergency-requests");
  revalidatePath("/withdrawals");
  revalidatePath("/members");
}
