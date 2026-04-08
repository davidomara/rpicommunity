import type { Role } from "@prisma/client";

export function isAdmin(role?: Role | null) {
  return role === "ADMIN";
}

export function isTreasurer(role?: Role | null) {
  return role === "TREASURER";
}

export function isStaff(role?: Role | null) {
  return isAdmin(role) || isTreasurer(role);
}

export function canManageFinance(role?: Role | null) {
  return isStaff(role);
}

export function canManageMembers(role?: Role | null) {
  return isStaff(role);
}

export function canManageProtectedDocuments(role?: Role | null) {
  return isStaff(role);
}

export function canApproveEmergencyDisbursements(role?: Role | null) {
  return isStaff(role);
}

export function canViewProtectedDocuments(role?: Role | null) {
  return isStaff(role) || role === "MEMBER";
}
