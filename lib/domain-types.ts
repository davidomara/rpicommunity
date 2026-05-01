export type Role = "ADMIN" | "MEMBER" | "TREASURER";
export type MemberStatus = "ACTIVE" | "WARNING" | "CLOSED";
export type EmergencyStatus = "PENDING" | "APPROVED" | "REJECTED";
export type TransactionType = "CONTRIBUTION" | "WITHDRAWAL";
export type WithdrawalPurpose = "SAVINGS" | "WELFARE";
export type StatementType = "PDF" | "IMAGE";
export type StatusMode = "AUTO" | "MANUAL";
export type ChangeRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ContributionApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export const ROLE = {
  ADMIN: "ADMIN" as Role,
  MEMBER: "MEMBER" as Role,
  TREASURER: "TREASURER" as Role
};

export const MEMBER_STATUS = {
  ACTIVE: "ACTIVE" as MemberStatus,
  WARNING: "WARNING" as MemberStatus,
  CLOSED: "CLOSED" as MemberStatus
};

export const EMERGENCY_STATUS = {
  PENDING: "PENDING" as EmergencyStatus,
  APPROVED: "APPROVED" as EmergencyStatus,
  REJECTED: "REJECTED" as EmergencyStatus
};

export const TRANSACTION_TYPE = {
  CONTRIBUTION: "CONTRIBUTION" as TransactionType,
  WITHDRAWAL: "WITHDRAWAL" as TransactionType
};

export const WITHDRAWAL_PURPOSE = {
  SAVINGS: "SAVINGS" as WithdrawalPurpose,
  WELFARE: "WELFARE" as WithdrawalPurpose
};

export const STATEMENT_TYPE = {
  PDF: "PDF" as StatementType,
  IMAGE: "IMAGE" as StatementType
};

export const STATUS_MODE = {
  AUTO: "AUTO" as StatusMode,
  MANUAL: "MANUAL" as StatusMode
};

export const CHANGE_REQUEST_STATUS = {
  PENDING: "PENDING" as ChangeRequestStatus,
  APPROVED: "APPROVED" as ChangeRequestStatus,
  REJECTED: "REJECTED" as ChangeRequestStatus
};

export const CONTRIBUTION_APPROVAL_STATUS = {
  PENDING: "PENDING" as ContributionApprovalStatus,
  APPROVED: "APPROVED" as ContributionApprovalStatus,
  REJECTED: "REJECTED" as ContributionApprovalStatus
};

export const COMMUNITY_ROLES: Role[] = [ROLE.ADMIN, ROLE.TREASURER, ROLE.MEMBER];
