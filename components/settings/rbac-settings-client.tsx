"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { assignAccessRoleAction, updateRolePermissionsAction, type SettingsFormState } from "@/app/(dashboard)/settings/actions";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataScroll } from "@/components/ui/data-scroll";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PermissionDefinition = {
  key: string;
  module: string;
  name: string;
  description: string;
};

type AccessRoleOverview = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissionKeys: string[];
  permissionCount: number;
  userCount: number;
};

type UserAccessAssignment = {
  id: string;
  name: string;
  username: string;
  email: string;
  status: string;
  legacyRole: string;
  assignedAccessRoleId: string | null;
  assignedAccessRoleKey: string | null;
  assignedAccessRoleName: string | null;
  effectiveAccessRoleKey: string;
  effectiveAccessRoleName: string;
  accessSource: "assigned" | "legacy";
};

const initialState: SettingsFormState = {
  success: false,
  error: "",
  message: ""
};

function RolePermissionForm({
  role,
  permissions,
  canManageRoles
}: {
  role: AccessRoleOverview;
  permissions: PermissionDefinition[];
  canManageRoles: boolean;
}) {
  const [state, formAction] = useFormState(updateRolePermissionsAction, initialState);
  const router = useRouter();
  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, PermissionDefinition[]>>((groups, permission) => {
      groups[permission.module] = [...(groups[permission.module] ?? []), permission];
      return groups;
    }, {});
  }, [permissions]);

  useEffect(() => {
    if (!state.success) return;
    router.refresh();
  }, [router, state.success]);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{role.name}</CardTitle>
            <p className="mt-1 text-sm leading-6 text-slate-500">{role.description || "No description provided."}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">{role.permissionCount} permissions</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">{role.userCount} users</span>
            {role.isSystem ? (
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-cyan-800">System role</span>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="roleId" value={role.id} />
          <FormMessage type="error" message={state.error} />
          <FormMessage type="success" message={state.message} />
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
              <div key={module} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{module.replace(/_/g, " ")}</p>
                <div className="mt-3 space-y-3">
                  {modulePermissions.map((permission) => {
                    const checked = role.permissionKeys.includes(permission.key);
                    return (
                      <label key={permission.key} className="flex items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          name="permissionKeys"
                          value={permission.key}
                          defaultChecked={checked}
                          disabled={!canManageRoles}
                          className="mt-1 h-4 w-4 rounded border-slate-300"
                        />
                        <span>
                          <span className="block font-medium text-slate-900">{permission.name}</span>
                          <span className="block text-xs leading-5 text-slate-500">{permission.key} · {permission.description}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {canManageRoles ? (
            <SubmitButton label={`Save ${role.name}`} pendingLabel="Saving..." className="w-full sm:w-auto" />
          ) : (
            <p className="text-sm text-slate-500">You can review this role, but you do not have permission to update role permissions.</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function UserAccessAssignmentRow({
  user,
  roles,
  canManageUsers
}: {
  user: UserAccessAssignment;
  roles: AccessRoleOverview[];
  canManageUsers: boolean;
}) {
  const [state, formAction] = useFormState(assignAccessRoleAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (!state.success) return;
    router.refresh();
  }, [router, state.success]);

  return (
    <tr>
      <td className="min-w-[220px]">
        <div className="font-medium text-slate-900">{user.name}</div>
        <div className="mt-1 text-xs text-slate-500">{user.username} · {user.email}</div>
      </td>
      <td className="whitespace-nowrap">{user.status}</td>
      <td className="whitespace-nowrap">{user.legacyRole}</td>
      <td className="min-w-[180px]">
        <div className="font-medium text-slate-900">{user.effectiveAccessRoleName}</div>
        <div className="mt-1 text-xs text-slate-500">{user.accessSource === "assigned" ? "Explicit assignment" : "Legacy fallback"}</div>
      </td>
      <td className="min-w-[260px]">
        <form action={formAction} className="space-y-2">
          <input type="hidden" name="userId" value={user.id} />
          <select
            name="accessRoleId"
            defaultValue={user.assignedAccessRoleId ?? ""}
            disabled={!canManageUsers}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            <option value="">Use legacy fallback</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <FormMessage type="error" message={state.error} className="text-xs" />
          <FormMessage type="success" message={state.message} className="text-xs" />
          {canManageUsers ? (
            <SubmitButton label="Save Assignment" pendingLabel="Saving..." className="w-full" />
          ) : (
            <p className="text-xs text-slate-500">You can review assignments but cannot change them.</p>
          )}
        </form>
      </td>
    </tr>
  );
}

function RoleDirectory({
  roles
}: {
  roles: AccessRoleOverview[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles</CardTitle>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Review the access roles available in the system and the current user coverage for each role.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <div key={role.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-950">{role.name}</h3>
                {role.isSystem ? (
                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-cyan-800">
                    System
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{role.description || "No description provided."}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
                  {role.permissionCount} permissions
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
                  {role.userCount} users
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RolePermissionsManager({
  permissions,
  roles,
  canManageRoles
}: {
  permissions: PermissionDefinition[];
  roles: AccessRoleOverview[];
  canManageRoles: boolean;
}) {
  const [activeRoleId, setActiveRoleId] = useState(roles[0]?.id ?? "");
  const activeRole = roles.find((role) => role.id === activeRoleId) ?? roles[0] ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions</CardTitle>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Role permissions control menu visibility, page access, and allowed actions across the application.
          Select one role to expand its full access definition.
        </p>
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Access Roles</p>
          <div className="grid gap-2">
            {roles.map((role) => {
              const active = role.id === activeRole?.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setActiveRoleId(role.id)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left transition",
                    active
                      ? "border-cyan-300 bg-cyan-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={cn("font-medium", active ? "text-cyan-950" : "text-slate-900")}>{role.name}</span>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {role.permissionCount}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{role.description || "No description provided."}</p>
                  <p className="mt-2 text-[11px] font-medium text-slate-500">
                    {role.userCount} user{role.userCount === 1 ? "" : "s"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
        <div className="min-w-0">
          {activeRole ? (
            <RolePermissionForm
              key={activeRole.id}
              role={activeRole}
              permissions={permissions}
              canManageRoles={canManageRoles}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-sm text-slate-500">
              No access roles are available.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RoleAssignmentsManager({
  roles,
  users,
  canManageUsers
}: {
  roles: AccessRoleOverview[];
  users: UserAccessAssignment[];
  canManageUsers: boolean;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const filteredUsers = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((user) =>
      [user.name, user.username, user.email, user.effectiveAccessRoleName, user.legacyRole]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [deferredQuery, users]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Assignment</CardTitle>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Assign explicit access roles to users, or leave them on the legacy fallback mapping while you transition.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users by name, username, email, or effective role"
        />
        <p className={cn("text-xs text-slate-500", !canManageUsers && "text-amber-700")}>
          {canManageUsers
            ? "Explicit assignments take priority over legacy fallback access."
            : "You can review role assignments, but you do not have permission to change them."}
        </p>
        <DataScroll className="max-h-[760px]">
          <table className="data-table min-w-[1080px]">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Legacy Role</th>
                <th>Effective Access</th>
                <th>Assigned Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length ? filteredUsers.map((user) => (
                <UserAccessAssignmentRow
                  key={user.id}
                  user={user}
                  roles={roles}
                  canManageUsers={canManageUsers}
                />
              )) : (
                <tr>
                  <td colSpan={5} className="text-sm text-slate-500">
                    No users matched the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataScroll>
      </CardContent>
    </Card>
  );
}

export function PermissionsSettingsClient({
  permissions,
  roles,
  canManageRoles
}: {
  permissions: PermissionDefinition[];
  roles: AccessRoleOverview[];
  canManageRoles: boolean;
}) {
  return <RolePermissionsManager permissions={permissions} roles={roles} canManageRoles={canManageRoles} />;
}

export function RolesSettingsClient({
  roles,
  users,
  canManageUsers
}: {
  roles: AccessRoleOverview[];
  users: UserAccessAssignment[];
  canManageUsers: boolean;
}) {
  return (
    <div className="space-y-6">
      <RoleDirectory roles={roles} />
      <RoleAssignmentsManager roles={roles} users={users} canManageUsers={canManageUsers} />
    </div>
  );
}
