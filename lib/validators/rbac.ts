import { z } from "zod";

export const updateRolePermissionsSchema = z.object({
  roleId: z.string().min(1, "Role is required"),
  permissionKeys: z.array(z.string()).default([])
});

export const assignAccessRoleSchema = z.object({
  userId: z.string().min(1, "User is required"),
  accessRoleId: z.string().optional().or(z.literal(""))
});
