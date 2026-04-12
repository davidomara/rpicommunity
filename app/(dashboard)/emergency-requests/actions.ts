"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canApproveEmergencyDisbursements, canManageMembers, isAdmin, isTreasurer } from "@/lib/rbac";
import { emergencyRequestSchema, emergencyDecisionSchema } from "@/lib/validators/finance";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

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

  const memberId = canManageMembers(session.user.role) ? parsed.data.memberId : session.user.id;
  const member = await prisma.user.findUnique({
    where: { id: memberId },
    select: { id: true }
  });
  if (!member) {
    return {
      success: false,
      error: "Selected member was not found"
    };
  }

  await prisma.emergencyRequest.create({
    data: {
      memberId,
      amount: parsed.data.amount,
      reason: parsed.data.reason
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/emergency-requests");
  revalidatePath("/notifications");

  return {
    success: true,
    error: ""
  };
}

export async function decideEmergencyRequestAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canApproveEmergencyDisbursements(session.user.role)) throw new Error("Unauthorized");

  const parsed = emergencyDecisionSchema.parse({
    requestId: String(formData.get("requestId") || ""),
    status: String(formData.get("status") || ""),
    disbursementAmount: formData.get("disbursementAmount")
  });

  await prisma.$transaction(async (tx) => {
    const request = await tx.emergencyRequest.findUnique({
      where: { id: parsed.requestId },
      select: {
        id: true,
        memberId: true,
        amount: true,
        approvedAmount: true,
        reason: true,
        status: true
        ,
        adminApprovedAt: true,
        treasurerApprovedAt: true,
        decisionDate: true
      }
    });

    if (!request) throw new Error("Emergency request not found");
    if (request.status !== "PENDING") return;

    if (parsed.status === "REJECTED") {
      await tx.emergencyRequest.updateMany({
        where: {
          id: parsed.requestId,
          status: "PENDING"
        },
        data: {
          status: "REJECTED",
          decisionDate: new Date(),
          rejectedById: session.user.id
        }
      });
      return;
    }

    const requestedAmount = Number(request.amount);
    const proposedAmount = parsed.disbursementAmount ?? Number(request.approvedAmount ?? request.amount);
    const role = session.user.role as Role;

    const approvalWhere =
      isAdmin(role)
        ? { id: parsed.requestId, status: "PENDING" as const, adminApprovedAt: null }
        : isTreasurer(role)
          ? { id: parsed.requestId, status: "PENDING" as const, treasurerApprovedAt: null }
          : null;

    if (!approvalWhere) throw new Error("Unauthorized");

    const approvalData =
      isAdmin(role)
        ? {
            approvedAmount: proposedAmount,
            adminApprovedAt: new Date(),
            adminApprovedById: session.user.id
          }
        : {
            approvedAmount: proposedAmount,
            treasurerApprovedAt: new Date(),
            treasurerApprovedById: session.user.id
          };

    const updated = await tx.emergencyRequest.updateMany({
      where: approvalWhere,
      data: approvalData
    });

    if (!updated.count) return;

    const current = await tx.emergencyRequest.findUnique({
      where: { id: parsed.requestId },
      select: {
        memberId: true,
        reason: true,
        amount: true,
        approvedAmount: true,
        status: true,
        decisionDate: true,
        adminApprovedAt: true,
        treasurerApprovedAt: true
      }
    });

    if (!current || current.status !== "PENDING" || current.decisionDate || !current.adminApprovedAt || !current.treasurerApprovedAt) {
      return;
    }

    const disbursedAmount = Number(current.approvedAmount ?? current.amount);
    const amountNote =
      disbursedAmount === requestedAmount
        ? "Emergency request approved by Admin and Treasurer, then disbursed"
        : `Emergency request approved by Admin and Treasurer. Requested ${requestedAmount}, disbursed ${disbursedAmount}`;

    const finalized = await tx.emergencyRequest.updateMany({
      where: {
        id: parsed.requestId,
        status: "PENDING",
        decisionDate: null
      },
      data: {
        status: "APPROVED",
        decisionDate: new Date(),
        disbursedAt: new Date(),
        disbursedById: session.user.id,
        approvedAmount: disbursedAmount
      }
    });

    if (!finalized.count) return;

    const withdrawal = await tx.withdrawal.create({
      data: {
        memberId: current.memberId,
        amount: disbursedAmount,
        reason: `Emergency disbursement: ${current.reason}`,
        withdrawalDate: new Date(),
        createdById: session.user.id
      }
    });

    await tx.transaction.create({
      data: {
        memberId: current.memberId,
        type: "WITHDRAWAL",
        amount: disbursedAmount,
        eventDate: withdrawal.withdrawalDate,
        actorId: session.user.id,
        notes: amountNote
      }
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/emergency-requests");
  revalidatePath("/notifications");
  revalidatePath("/withdrawals");
  revalidatePath("/members");
}
