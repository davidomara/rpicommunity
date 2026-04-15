export const ROLE = {
  ADMIN: "ADMIN",
  TREASURER: "TREASURER",
  MEMBER: "MEMBER"
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

export const MEMBER_STATUS = {
  ACTIVE: "ACTIVE",
  WARNING: "WARNING",
  CLOSED: "CLOSED"
} as const;

export type MemberStatus = (typeof MEMBER_STATUS)[keyof typeof MEMBER_STATUS];

export const CHANGE_REQUEST_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
} as const;

export type ChangeRequestStatus = (typeof CHANGE_REQUEST_STATUS)[keyof typeof CHANGE_REQUEST_STATUS];

export const EMERGENCY_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
} as const;

export type EmergencyStatus = (typeof EMERGENCY_STATUS)[keyof typeof EMERGENCY_STATUS];

export const CONTRIBUTION_APPROVAL_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
} as const;

export type ContributionApprovalStatus = (typeof CONTRIBUTION_APPROVAL_STATUS)[keyof typeof CONTRIBUTION_APPROVAL_STATUS];

export const TRANSACTION_TYPE = {
  CONTRIBUTION: "CONTRIBUTION",
  WITHDRAWAL: "WITHDRAWAL"
} as const;

export type TransactionType = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];

export const STATEMENT_TYPE = {
  PDF: "PDF",
  IMAGE: "IMAGE"
} as const;

export type StatementType = (typeof STATEMENT_TYPE)[keyof typeof STATEMENT_TYPE];
