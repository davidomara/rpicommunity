import { ROLE, type Role } from "@/lib/domain-types";

export const ACCESS_ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  AUDITOR: "AUDITOR",
  STAFF: "STAFF",
  VIEWER: "VIEWER"
} as const;

export type AccessRoleKey = (typeof ACCESS_ROLE)[keyof typeof ACCESS_ROLE];

export type PermissionDefinition = {
  key: string;
  module: string;
  name: string;
  description: string;
};

export const permissionDefinitions = [
  { key: "dashboard.view", module: "dashboard", name: "View Dashboard", description: "Access dashboard summaries and overview pages." },
  { key: "members.view", module: "members", name: "View Members", description: "View the members directory and member status details." },
  { key: "members.create", module: "members", name: "Create Members", description: "Add new members to the community." },
  { key: "members.edit", module: "members", name: "Edit Members", description: "Change member roles and submit status changes." },
  { key: "members.delete", module: "members", name: "Delete Members", description: "Delete members or remove member records." },
  { key: "members.review", module: "members", name: "Review Member Changes", description: "Approve or reject pending member status changes." },
  { key: "contributions.view", module: "contributions", name: "View Contributions", description: "View contribution records." },
  { key: "contributions.view_all", module: "contributions", name: "View All Contributions", description: "View contribution records for all members." },
  { key: "contributions.create", module: "contributions", name: "Create Contributions", description: "Record or submit new contribution entries." },
  { key: "contributions.review", module: "contributions", name: "Review Contributions", description: "Approve or reject pending contribution submissions." },
  { key: "contributions.export", module: "contributions", name: "Export Contributions", description: "Export contribution records and reports." },
  { key: "withdrawals.view", module: "withdrawals", name: "View Withdrawals", description: "View withdrawal records." },
  { key: "withdrawals.create", module: "withdrawals", name: "Create Withdrawals", description: "Create withdrawal entries." },
  { key: "withdrawals.export", module: "withdrawals", name: "Export Withdrawals", description: "Export withdrawal records and reports." },
  { key: "emergency_requests.view", module: "emergency_requests", name: "View Emergency Requests", description: "View emergency request records." },
  { key: "emergency_requests.create", module: "emergency_requests", name: "Create Emergency Requests", description: "Submit emergency requests." },
  { key: "emergency_requests.review", module: "emergency_requests", name: "Review Emergency Requests", description: "Approve, reject, and disburse emergency requests." },
  { key: "emergency_requests.export", module: "emergency_requests", name: "Export Emergency Requests", description: "Export emergency request records and reports." },
  { key: "notifications.view", module: "notifications", name: "View Notifications", description: "Access shared workflow notifications and inbox items." },
  { key: "bank_statements.view", module: "bank_statements", name: "View Bank Statements", description: "Access protected bank statements." },
  { key: "bank_statements.manage", module: "bank_statements", name: "Manage Bank Statements", description: "Upload and manage bank statements." },
  { key: "constitution.view", module: "constitution", name: "View Constitution", description: "Access the governing constitution document." },
  { key: "constitution.manage", module: "constitution", name: "Manage Constitution", description: "Upload and manage constitution documents." },
  { key: "constitution.delete", module: "constitution", name: "Delete Constitution Documents", description: "Delete governing constitution documents." },
  { key: "reports.view", module: "reports", name: "View Reports", description: "Access reporting views." },
  { key: "reports.export", module: "reports", name: "Export Reports", description: "Export reports from the system." },
  { key: "logs.view", module: "logs", name: "View Logs", description: "Access system or workflow logs." },
  { key: "account.view", module: "account", name: "View Account Settings", description: "Access personal account settings." },
  { key: "settings.view", module: "settings", name: "View Settings", description: "Open the RBAC settings area." },
  { key: "settings.manage", module: "settings", name: "Manage Settings", description: "Manage global settings." },
  { key: "roles.manage", module: "roles", name: "Manage Roles", description: "Update role permission assignments." },
  { key: "users.manage", module: "users", name: "Manage User Access", description: "Assign access roles and manage user access." }
] as const satisfies readonly PermissionDefinition[];

export type PermissionKey = (typeof permissionDefinitions)[number]["key"];

export type AuthorizationUserRecord = {
  id: string;
  role?: string | null;
  accessRole?: {
    key: string;
    name: string;
    rolePermissions: Array<{
      permission: {
        key: string;
      };
    }>;
  } | null;
};

export type AuthorizationContext = {
  userId: string;
  legacyRole: Role;
  accessRoleKey: string;
  accessRoleName: string;
  source: "assigned" | "legacy";
  permissionKeys: PermissionKey[];
  isReadOnly: boolean;
};

export type DualApprovalActor = "ADMIN" | "MANAGER";

const permissionDefinitionMap = new Map<string, (typeof permissionDefinitions)[number]>(
  permissionDefinitions.map((permission) => [permission.key, permission])
);

const ACCESS_ROLE_LABELS: Record<AccessRoleKey, string> = {
  [ACCESS_ROLE.SUPER_ADMIN]: "Super Admin",
  [ACCESS_ROLE.ADMIN]: "Admin",
  [ACCESS_ROLE.MANAGER]: "Manager",
  [ACCESS_ROLE.AUDITOR]: "Auditor",
  [ACCESS_ROLE.STAFF]: "Staff",
  [ACCESS_ROLE.VIEWER]: "Viewer"
};

const accessRoleDescriptions: Record<AccessRoleKey, string> = {
  [ACCESS_ROLE.SUPER_ADMIN]: "Full administrative access across all modules, settings, and approval workflows.",
  [ACCESS_ROLE.ADMIN]: "Operational administration with broad management rights across member and finance workflows.",
  [ACCESS_ROLE.MANAGER]: "Finance and approval management with review authority for controlled workflows.",
  [ACCESS_ROLE.AUDITOR]: "Read-only access to records, reports, and logs for oversight and audit review.",
  [ACCESS_ROLE.STAFF]: "Day-to-day member access for self-service records and protected viewing rights.",
  [ACCESS_ROLE.VIEWER]: "Read-only access to dashboards, records, and protected documents."
};

const ACCESS_ROLES = Object.values(ACCESS_ROLE);

const defaultRolePermissions: Record<AccessRoleKey, PermissionKey[]> = {
  [ACCESS_ROLE.SUPER_ADMIN]: permissionDefinitions.map((permission) => permission.key),
  [ACCESS_ROLE.ADMIN]: [
    "dashboard.view",
    "members.view",
    "members.create",
    "members.edit",
    "members.review",
    "contributions.view",
    "contributions.view_all",
    "contributions.create",
    "contributions.review",
    "contributions.export",
    "withdrawals.view",
    "withdrawals.create",
    "withdrawals.export",
    "emergency_requests.view",
    "emergency_requests.create",
    "emergency_requests.review",
    "emergency_requests.export",
    "notifications.view",
    "bank_statements.view",
    "bank_statements.manage",
    "constitution.view",
    "constitution.manage",
    "constitution.delete",
    "reports.view",
    "reports.export",
    "logs.view",
    "account.view",
    "settings.view",
    "settings.manage",
    "users.manage"
  ],
  [ACCESS_ROLE.MANAGER]: [
    "dashboard.view",
    "members.view",
    "members.review",
    "contributions.view",
    "contributions.view_all",
    "contributions.create",
    "contributions.review",
    "contributions.export",
    "withdrawals.view",
    "withdrawals.create",
    "withdrawals.export",
    "emergency_requests.view",
    "emergency_requests.create",
    "emergency_requests.review",
    "emergency_requests.export",
    "notifications.view",
    "bank_statements.view",
    "constitution.view",
    "reports.view",
    "reports.export",
    "logs.view",
    "account.view"
  ],
  [ACCESS_ROLE.AUDITOR]: [
    "dashboard.view",
    "members.view",
    "contributions.view",
    "contributions.view_all",
    "withdrawals.view",
    "emergency_requests.view",
    "bank_statements.view",
    "constitution.view",
    "reports.view",
    "reports.export",
    "logs.view",
    "account.view"
  ],
  [ACCESS_ROLE.STAFF]: [
    "dashboard.view",
    "members.view",
    "contributions.view",
    "contributions.create",
    "emergency_requests.view",
    "emergency_requests.create",
    "bank_statements.view",
    "constitution.view",
    "account.view"
  ],
  [ACCESS_ROLE.VIEWER]: [
    "dashboard.view",
    "members.view",
    "contributions.view",
    "withdrawals.view",
    "emergency_requests.view",
    "bank_statements.view",
    "constitution.view",
    "reports.view",
    "logs.view",
    "account.view"
  ]
};

const readOnlyWritePrefixes = [".create", ".edit", ".delete", ".review", ".manage"];

export const settingsAccessPermissions: PermissionKey[] = [
  "settings.view",
  "settings.manage",
  "roles.manage",
  "users.manage"
];

function normalizePermissionKeys(keys: Iterable<string>): PermissionKey[] {
  return Array.from(new Set(Array.from(keys).filter(isPermissionKey))).sort((left, right) => left.localeCompare(right));
}

export function deriveLegacyAccessRoleKey(role?: string | null): AccessRoleKey {
  if (role === ROLE.ADMIN) return ACCESS_ROLE.SUPER_ADMIN;
  if (role === ROLE.TREASURER) return ACCESS_ROLE.MANAGER;
  return ACCESS_ROLE.STAFF;
}

export function resolveAuthorizationContext(user: AuthorizationUserRecord): AuthorizationContext {
  const assignedRole = user.accessRole;
  const accessRoleKey = assignedRole?.key || deriveLegacyAccessRoleKey(user.role);
  const resolvedPermissions = assignedRole
    ? normalizePermissionKeys(assignedRole.rolePermissions.map((entry) => entry.permission.key))
    : getDefaultPermissionKeys(accessRoleKey as AccessRoleKey);

  return {
    userId: user.id,
    legacyRole: (user.role as Role) || ROLE.MEMBER,
    accessRoleKey,
    accessRoleName: assignedRole?.name || getAccessRoleLabel(accessRoleKey),
    source: assignedRole ? "assigned" : "legacy",
    permissionKeys: resolvedPermissions,
    isReadOnly: resolvedPermissions.every((key) => readOnlyWritePrefixes.every((suffix) => !key.endsWith(suffix)))
  };
}

export function getPermissionDefinitions() {
  return permissionDefinitions;
}

export function getPermissionDefinition(key: string) {
  return permissionDefinitionMap.get(key);
}

export function getDefaultPermissionKeys(roleKey: AccessRoleKey) {
  return [...defaultRolePermissions[roleKey]];
}

export function getAccessRoleLabel(roleKey: string) {
  return ACCESS_ROLE_LABELS[roleKey as AccessRoleKey] || roleKey;
}

export function getAccessRoleDescription(roleKey: AccessRoleKey) {
  return accessRoleDescriptions[roleKey];
}

export function getDualApprovalActor(accessRoleKey: string): DualApprovalActor | null {
  if (accessRoleKey === ACCESS_ROLE.SUPER_ADMIN || accessRoleKey === ACCESS_ROLE.ADMIN) {
    return "ADMIN";
  }

  if (accessRoleKey === ACCESS_ROLE.MANAGER) {
    return "MANAGER";
  }

  return null;
}

export function canDeleteGoverningDocuments(authorization: Pick<AuthorizationContext, "accessRoleKey" | "permissionKeys"> | null | undefined) {
  if (!authorization) return false;
  return (
    hasPermission(authorization, "constitution.delete") ||
    authorization.accessRoleKey === ACCESS_ROLE.SUPER_ADMIN ||
    authorization.accessRoleKey === ACCESS_ROLE.ADMIN
  );
}

export function getSeedAccessRoles() {
  return ACCESS_ROLES.map((roleKey) => ({
    key: roleKey,
    name: getAccessRoleLabel(roleKey),
    description: getAccessRoleDescription(roleKey),
    permissions: getDefaultPermissionKeys(roleKey)
  }));
}

export function isPermissionKey(value: string): value is PermissionKey {
  return permissionDefinitionMap.has(value);
}

export function hasPermission(
  source: Pick<AuthorizationContext, "permissionKeys"> | string[] | Set<string> | null | undefined,
  permission: PermissionKey
) {
  if (!source) return false;
  if (source instanceof Set) return source.has(permission);
  const permissionList = Array.isArray(source) ? source : source.permissionKeys;
  return permissionList.includes(permission);
}

export function hasAnyPermission(
  source: Pick<AuthorizationContext, "permissionKeys"> | string[] | Set<string> | null | undefined,
  permissions: PermissionKey[]
) {
  return permissions.some((permission) => hasPermission(source, permission));
}

export function isReadOnlyAuthorization(source: Pick<AuthorizationContext, "permissionKeys"> | string[] | Set<string>) {
  const permissionList = source instanceof Set ? Array.from(source) : Array.isArray(source) ? source : source.permissionKeys;
  return permissionList.every((key) => readOnlyWritePrefixes.every((suffix) => !key.endsWith(suffix)));
}

export function canAccessSettings(source: Pick<AuthorizationContext, "permissionKeys"> | string[] | Set<string> | null | undefined) {
  return hasAnyPermission(source, settingsAccessPermissions);
}
