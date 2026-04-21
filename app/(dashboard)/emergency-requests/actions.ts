"use server";

import { auth } from "@/auth";
import { getAvailableCommunityBalance } from "@/lib/community-balance";
import { prisma } from "@/lib/db";
import { getCurrentUserAuthorization, getDualApprovalActor, hasPermission } from "@/lib/rbac";
import { formatMoney } from "@/lib/utils";
import { emergencyRequestSchema, emergencyDecisionSchema } from "@/lib/validators/finance";
import { revalidatePath } from "next/cache";

export type EmergencyRequestFormState = {
  success: boolean;
  error: string;
};

export type EmergencyDecisionFormState = {
  success: boolean;
  error: string;
  message: string;
};

export async function createEmergencyRequestAction(
  _: EmergencyRequestFormState,
  formData: FormData
): Promise<EmergencyRequestFormState> {
  const session = await auth();
  const authorization = await getCurrentUserAuthorization();
  if (!session?.user || !authorization || !hasPermission(authorization, "emergency_requests.create")) {
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

  const canCreateForOthers = hasPermission(authorization, "emergency_requests.review") || hasPermission(authorization, "members.edit");
  const memberId = canCreateForOthers ? parsed.data.memberId : session.user.id;
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
  return decideEmergencyRequestSubmission(formData);
}

async function decideEmergencyRequestSubmission(formData: FormData): Promise<EmergencyDecisionFormState> {
  const session = await auth();
  const authorization = await getCurrentUserAuthorization();
  const actorApprovalRole = authorization ? getDualApprovalActor(authorization.accessRoleKey) : null;
  if (!session?.user || !authorization || !hasPermission(authorization, "emergency_requests.review") || !actorApprovalRole) {
    return {
      success: false,
      error: "Unauthorized",
      message: ""
    };
  }

  const parsed = emergencyDecisionSchema.safeParse({
    requestId: String(formData.get("requestId") || ""),
    status: String(formData.get("status") || ""),
    disbursementAmount: formData.get("disbursementAmount")
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid emergency decision",
      message: ""
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const request = await tx.emergencyRequest.findUnique({
      where: { id: parsed.data.requestId },
      select: {
        id: true,
        memberId: true,
        amount: true,
        approvedAmount: true,
        reason: true,
        status: true,
        adminApprovedAt: true,
        treasurerApprovedAt: true,
        decisionDate: true
      }
    });

    if (!request) {
      return {
        success: false,
        error: "Emergency request not found",
        message: ""
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        error: "This emergency request has already been finalized.",
        message: ""
      };
    }

    if (parsed.data.status === "REJECTED") {
      const rejected = await tx.emergencyRequest.updateMany({
        where: {
          id: parsed.data.requestId,
          status: "PENDING"
        },
        data: {
          status: "REJECTED",
          decisionDate: new Date(),
          rejectedById: session.user.id
        }
      });

      if (!rejected.count) {
        return {
          success: false,
          error: "This emergency request could not be rejected because it changed before your action was saved.",
          message: ""
        };
      }

      return {
        success: true,
        error: "",
        message: "Emergency request rejected."
      };
    }

    const requestedAmount = Number(request.amount);
    const proposedAmount = parsed.data.disbursementAmount ?? Number(request.approvedAmount ?? request.amount);
    const actorLabel = actorApprovalRole === "ADMIN" ? "Admin" : "Manager";
    const completingApproval =
      (actorApprovalRole === "ADMIN" && Boolean(request.treasurerApprovedAt)) ||
      (actorApprovalRole === "MANAGER" && Boolean(request.adminApprovedAt));

    const approvalWhere =
      actorApprovalRole === "ADMIN"
        ? { id: parsed.data.requestId, status: "PENDING" as const, adminApprovedAt: null }
        : actorApprovalRole === "MANAGER"
          ? { id: parsed.data.requestId, status: "PENDING" as const, treasurerApprovedAt: null }
          : null;

    if (!approvalWhere) {
      return {
        success: false,
        error: "Unauthorized",
        message: ""
      };
    }

    if (completingApproval) {
      const currentBalance = await getAvailableCommunityBalance(tx);

      if (proposedAmount > currentBalance) {
        return {
          success: false,
          error: `Insufficient available balance for this disbursement. Available: ${formatMoney(currentBalance)}. Requested: ${formatMoney(proposedAmount)}.`,
          message: ""
        };
      }
    }

    const approvalData =
      actorApprovalRole === "ADMIN"
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

    if (!updated.count) {
      return {
        success: false,
        error: `Your ${actorLabel} approval has already been recorded for this request.`,
        message: ""
      };
    }

    const current = await tx.emergencyRequest.findUnique({
      where: { id: parsed.data.requestId },
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
      return {
        success: true,
        error: "",
        message: `${actorLabel} approval recorded. Waiting for the other approver before disbursement.`
      };
    }

    const disbursedAmount = Number(current.approvedAmount ?? current.amount);
    const currentBalance = await getAvailableCommunityBalance(tx);

    const amountNote =
      disbursedAmount === requestedAmount
        ? "Emergency request approved by Admin and Manager, then disbursed"
        : `Emergency request approved by Admin and Manager. Requested ${requestedAmount}, disbursed ${disbursedAmount}`;

    const finalized = await tx.emergencyRequest.updateMany({
      where: {
        id: parsed.data.requestId,
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

    if (!finalized.count) {
      return {
        success: false,
        error: "This emergency request changed before disbursement could be completed.",
        message: ""
      };
    }

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

    return {
      success: true,
      error: "",
      message: `Emergency request approved and disbursed. Remaining available balance: ${formatMoney(currentBalance - disbursedAmount)}.`
    };
  });

  if (!result.success) {
    return result;
  }

  revalidatePath("/dashboard");
  revalidatePath("/emergency-requests");
  revalidatePath("/notifications");
  revalidatePath("/withdrawals");
  revalidatePath("/members");

  return result;
}

export async function approveEmergencyRequestAction(
  _: EmergencyDecisionFormState,
  formData: FormData
): Promise<EmergencyDecisionFormState> {
  return decideEmergencyRequestSubmission(formData);
}

export async function rejectEmergencyRequestAction(
  _: EmergencyDecisionFormState,
  formData: FormData
): Promise<EmergencyDecisionFormState> {
  return decideEmergencyRequestSubmission(formData);
}
