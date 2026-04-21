import "server-only";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  canAccessSettings,
  deriveLegacyAccessRoleKey,
  getAccessRoleDescription,
  getAccessRoleLabel,
  getDefaultPermissionKeys,
  getDualApprovalActor,
  getPermissionDefinition,
  getPermissionDefinitions,
  getSeedAccessRoles,
  hasAnyPermission,
  hasPermission,
  isPermissionKey,
  isReadOnlyAuthorization,
  resolveAuthorizationContext,
  settingsAccessPermissions,
  type AuthorizationContext,
  type AuthorizationUserRecord,
  type DualApprovalActor,
  type PermissionKey
} from "@/lib/rbac-core";

export {
  canAccessSettings,
  deriveLegacyAccessRoleKey,
  getAccessRoleDescription,
  getAccessRoleLabel,
  getDefaultPermissionKeys,
  getDualApprovalActor,
  getPermissionDefinition,
  getPermissionDefinitions,
  getSeedAccessRoles,
  hasAnyPermission,
  hasPermission,
  isPermissionKey,
  isReadOnlyAuthorization,
  settingsAccessPermissions
};

export type {
  AuthorizationContext,
  AuthorizationUserRecord,
  DualApprovalActor,
  PermissionKey
};

export async function getUserAuthorization(userId: string): Promise<AuthorizationContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      accessRole: {
        select: {
          key: true,
          name: true,
          rolePermissions: {
            select: {
              permission: {
                select: {
                  key: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    return null;
  }

  return resolveAuthorizationContext(user as AuthorizationUserRecord);
}

export async function getCurrentUserAuthorization() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return getUserAuthorization(session.user.id);
}
