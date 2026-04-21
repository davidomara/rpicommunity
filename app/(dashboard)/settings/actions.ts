"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUserAuthorization, hasPermission, isPermissionKey } from "@/lib/rbac";
import { assignAccessRoleSchema, updateRolePermissionsSchema } from "@/lib/validators/rbac";

export type SettingsFormState = {
  success: boolean;
  error: string;
  message: string;
};

const initialResponse = {
  success: false,
  error: "",
  message: ""
} satisfies SettingsFormState;

function success(message: string): SettingsFormState {
  return { ...initialResponse, success: true, message };
}

function failure(error: string): SettingsFormState {
  return { ...initialResponse, error };
}

export async function updateRolePermissionsAction(
  _: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const authorization = await getCurrentUserAuthorization();
  if (!authorization || !hasPermission(authorization, "roles.manage")) {
    return failure("Unauthorized");
  }

  const parsed = updateRolePermissionsSchema.safeParse({
    roleId: String(formData.get("roleId") || ""),
    permissionKeys: formData.getAll("permissionKeys").map((value) => String(value || ""))
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message || "Invalid role permission payload");
  }

  const permissionKeys = parsed.data.permissionKeys.filter(isPermissionKey);

  const role = await prisma.accessRole.findUnique({
    where: { id: parsed.data.roleId },
    select: { id: true, name: true }
  });

  if (!role) {
    return failure("Selected role was not found");
  }

  const permissions = await prisma.permission.findMany({
    where: { key: { in: permissionKeys } },
    select: { id: true }
  });

  await prisma.$transaction(async (tx) => {
    await tx.accessRolePermission.deleteMany({
      where: { roleId: role.id }
    });

    if (permissions.length) {
      await tx.accessRolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId: role.id,
          permissionId: permission.id
        }))
      });
    }
  });

  revalidatePath("/settings");
  revalidatePath("/settings/roles");
  revalidatePath("/settings/permissions");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  return success(`${role.name} permissions updated.`);
}

export async function assignAccessRoleAction(
  _: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const authorization = await getCurrentUserAuthorization();
  if (!authorization || !hasPermission(authorization, "users.manage")) {
    return failure("Unauthorized");
  }

  const parsed = assignAccessRoleSchema.safeParse({
    userId: String(formData.get("userId") || ""),
    accessRoleId: String(formData.get("accessRoleId") || "")
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message || "Invalid access role assignment");
  }

  if (parsed.data.userId === authorization.userId) {
    return failure("You cannot change your own access role from this screen");
  }

  if (parsed.data.accessRoleId) {
    const role = await prisma.accessRole.findUnique({
      where: { id: parsed.data.accessRoleId },
      select: { id: true, name: true }
    });

    if (!role) {
      return failure("Selected access role was not found");
    }

    await prisma.user.update({
      where: { id: parsed.data.userId },
      data: { accessRoleId: role.id }
    });

    revalidatePath("/settings");
    revalidatePath("/settings/roles");
    revalidatePath("/settings/permissions");
    revalidatePath("/dashboard");
    return success(`Assigned ${role.name} to the selected user.`);
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { accessRoleId: null }
  });

  revalidatePath("/settings");
  revalidatePath("/settings/roles");
  revalidatePath("/settings/permissions");
  revalidatePath("/dashboard");
  return success("Cleared the explicit access role. Legacy fallback access will be used.");
}
