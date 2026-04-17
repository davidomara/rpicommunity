"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CHANGE_REQUEST_STATUS, MEMBER_STATUS, ROLE, STATUS_MODE, type MemberStatus, type Role } from "@/lib/domain-types";
import { canManageMembers, isAdmin, isTreasurer } from "@/lib/rbac";
import { createMemberSchema, decideMemberStatusChangeSchema, requestMemberStatusChangeSchema, updateMemberRoleAndStatusSchema } from "@/lib/validators/account";
import { revalidatePath } from "next/cache";

export type CreateMemberFormState = {
  success: boolean;
  message: string;
  error: string;
};

export type MemberStatusChangeFormState = {
  success: boolean;
  error: string;
  message?: string;
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
      role: ROLE.MEMBER,
      status: MEMBER_STATUS.ACTIVE
      role: ROLE.MEMBER,
      status: MEMBER_STATUS.ACTIVE
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

export async function requestMemberStatusChangeAction(_: MemberStatusChangeFormState, formData: FormData): Promise<MemberStatusChangeFormState> {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return {
      success: false,
      error: "Unauthorized"
    };
  }

  const parsed = requestMemberStatusChangeSchema.safeParse({
    memberId: String(formData.get("memberId") || ""),
    requestedStatus: String(formData.get("requestedStatus") || "")
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid status change request"
    };
  }

  const member = await prisma.user.findUnique({
    where: { id: parsed.data.memberId },
    select: { id: true, role: true, status: true }
  });

  if (!member || member.role !== ROLE.MEMBER) {
  if (!member || member.role !== ROLE.MEMBER) {
    return {
      success: false,
      error: "Member not found"
    };
  }

  if (member.status === parsed.data.requestedStatus) {
    return {
      success: false,
      error: "Member already has that status"
    };
  }

  const existingPending = await prisma.memberStatusChangeRequest.findFirst({
    where: {
      memberId: member.id,
      status: CHANGE_REQUEST_STATUS.PENDING
      status: CHANGE_REQUEST_STATUS.PENDING
    },
    select: { id: true }
  });

  if (existingPending) {
    return {
      success: false,
      error: "A pending status change already exists for this member"
    };
  }

  await prisma.memberStatusChangeRequest.create({
    data: {
      memberId: member.id,
      currentStatus: member.status,
      requestedStatus: parsed.data.requestedStatus as MemberStatus,
      requestedById: session.user.id,
      adminApprovedAt: new Date(),
      adminApprovedById: session.user.id
    }
  });

  revalidatePath("/members");

  return {
    success: true,
    error: ""
  };
}

export async function updateMemberRoleAndStatusAction(_: MemberStatusChangeFormState, formData: FormData): Promise<MemberStatusChangeFormState> {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return {
      success: false,
      error: "Unauthorized",
      message: ""
    };
  }

  const parsed = updateMemberRoleAndStatusSchema.safeParse({
    memberId: String(formData.get("memberId") || ""),
    role: String(formData.get("role") || ""),
    requestedStatus: String(formData.get("requestedStatus") || "")
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid member update",
      message: ""
    };
  }

  const member = await prisma.user.findUnique({
    where: { id: parsed.data.memberId },
    select: { id: true, role: true, status: true }
  });

  if (!member || ![ROLE.ADMIN, ROLE.TREASURER, ROLE.MEMBER].includes(member.role as Role)) {
    return {
      success: false,
      error: "Member not found",
      message: ""
    };
  }

  if (member.id === session.user.id && member.role !== parsed.data.role) {
    return {
      success: false,
      error: "You cannot change your own role",
      message: ""
    };
  }

  const nextRole = parsed.data.role as Role;
  const nextStatus = parsed.data.requestedStatus as MemberStatus;
  const roleChanged = member.role !== nextRole;
  const statusChanged = member.status !== nextStatus;

  if (!roleChanged && !statusChanged) {
    return {
      success: false,
      error: "No changes to save",
      message: ""
    };
  }

  const existingPending = await prisma.memberStatusChangeRequest.findFirst({
    where: {
      memberId: member.id,
      status: CHANGE_REQUEST_STATUS.PENDING
      status: CHANGE_REQUEST_STATUS.PENDING
    },
    select: { id: true }
  });

  if (statusChanged && nextRole === ROLE.MEMBER && existingPending) {
  if (statusChanged && nextRole === ROLE.MEMBER && existingPending) {
    return {
      success: false,
      error: "A pending status change already exists for this member",
      message: ""
    };
  }

  const messages: string[] = [];

  await prisma.$transaction(async (tx) => {
    if (roleChanged) {
      await tx.user.update({
        where: { id: member.id },
        data: { role: nextRole }
      });
      messages.push(`Role updated to ${nextRole}.`);
    }

    if (!statusChanged) return;

    if (nextRole !== ROLE.MEMBER) {
    if (nextRole !== ROLE.MEMBER) {
      messages.push("Status was not changed because only members use manual status requests.");
      return;
    }

    await tx.memberStatusChangeRequest.create({
      data: {
        memberId: member.id,
        currentStatus: member.status,
        requestedStatus: nextStatus,
        requestedById: session.user.id,
        adminApprovedAt: new Date(),
        adminApprovedById: session.user.id
      }
    });
    messages.push("Status change request submitted.");
  });

  revalidatePath("/members");
  revalidatePath("/dashboard");

  return {
    success: true,
    error: "",
    message: messages.join(" ")
  };
}

export async function decideMemberStatusChangeAction(_: MemberStatusChangeFormState, formData: FormData): Promise<MemberStatusChangeFormState> {
  const session = await auth();
  if (!session?.user || !canManageMembers(session.user.role)) {
    return {
      success: false,
      error: "Unauthorized"
    };
  }

  const parsed = decideMemberStatusChangeSchema.safeParse({
    requestId: String(formData.get("requestId") || ""),
    decision: String(formData.get("decision") || "")
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid decision"
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const request = await tx.memberStatusChangeRequest.findUnique({
      where: { id: parsed.data.requestId },
      select: {
        id: true,
        memberId: true,
        requestedStatus: true,
        status: true,
        adminApprovedAt: true,
        treasurerApprovedAt: true
      }
    });

    if (!request || request.status !== CHANGE_REQUEST_STATUS.PENDING) {
    if (!request || request.status !== CHANGE_REQUEST_STATUS.PENDING) {
      return { ok: true };
    }

    if (parsed.data.decision === "REJECTED") {
      await tx.memberStatusChangeRequest.update({
        where: { id: request.id },
        data: {
          status: CHANGE_REQUEST_STATUS.REJECTED,
          status: CHANGE_REQUEST_STATUS.REJECTED,
          rejectedAt: new Date(),
          rejectedById: session.user.id
        }
      });
      return { ok: true };
    }

    const now = new Date();
    const updateData: Record<string, Date | string> = {};
    if (isAdmin(session.user.role) && !request.adminApprovedAt) {
      updateData.adminApprovedAt = now;
      updateData.adminApprovedById = session.user.id;
    }
    if (isTreasurer(session.user.role) && !request.treasurerApprovedAt) {
      updateData.treasurerApprovedAt = now;
      updateData.treasurerApprovedById = session.user.id;
    }

    if (!Object.keys(updateData).length) {
      return { ok: true };
    }

    const updated = await tx.memberStatusChangeRequest.update({
      where: { id: request.id },
      data: updateData
    });

    const fullyApproved = Boolean(updated.adminApprovedAt) && Boolean(updated.treasurerApprovedAt);
    if (fullyApproved) {
      await tx.user.update({
        where: { id: request.memberId },
        data: {
          status: updated.requestedStatus,
          statusMode: STATUS_MODE.MANUAL
        }
      });
      await tx.memberStatusChangeRequest.update({
        where: { id: request.id },
        data: {
          status: CHANGE_REQUEST_STATUS.APPROVED,
          status: CHANGE_REQUEST_STATUS.APPROVED,
          appliedAt: now,
          appliedById: session.user.id
        }
      });
    }

    return { ok: true };
  });

  if (!result.ok) {
    return {
      success: false,
      error: "Could not process request"
    };
  }

  revalidatePath("/members");
  revalidatePath("/dashboard");

  return {
    success: true,
    error: ""
  };
}
