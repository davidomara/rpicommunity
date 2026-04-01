import { Role } from "@prisma/client";

export function isAdmin(role?: Role | null) {
  return role === Role.ADMIN;
}

export function canManageFinance(role?: Role | null) {
  return role === Role.ADMIN;
}

export function canViewProtectedDocuments(role?: Role | null) {
  return role === Role.ADMIN || role === Role.MEMBER;
}
