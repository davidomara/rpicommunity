-- Baseline rebuilt for PostgreSQL from the current Prisma schema.
-- Later historical migration files are retained as intentional no-ops so
-- Prisma shadow databases apply a consistent PostgreSQL history.

-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(191) NOT NULL,
    "name" TEXT NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" VARCHAR(32) NOT NULL DEFAULT 'MEMBER',
    "accessRoleId" VARCHAR(191),
    "status" VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "statusMode" VARCHAR(32) NOT NULL DEFAULT 'AUTO',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessRole" (
    "id" VARCHAR(191) NOT NULL,
    "key" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" VARCHAR(191) NOT NULL,
    "key" VARCHAR(128) NOT NULL,
    "module" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessRolePermission" (
    "id" VARCHAR(191) NOT NULL,
    "roleId" VARCHAR(191) NOT NULL,
    "permissionId" VARCHAR(191) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" VARCHAR(191) NOT NULL,
    "memberId" VARCHAR(191) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "contributionDate" TIMESTAMP(3) NOT NULL,
    "createdById" VARCHAR(191),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvalStatus" VARCHAR(32) NOT NULL DEFAULT 'APPROVED',
    "approvedAt" TIMESTAMP(3),
    "approvedById" VARCHAR(191),
    "rejectedAt" TIMESTAMP(3),
    "rejectedById" VARCHAR(191),

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" VARCHAR(191) NOT NULL,
    "memberId" VARCHAR(191) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "purpose" VARCHAR(32) NOT NULL DEFAULT 'WELFARE',
    "withdrawalDate" TIMESTAMP(3) NOT NULL,
    "createdById" VARCHAR(191),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyRequest" (
    "id" VARCHAR(191) NOT NULL,
    "memberId" VARCHAR(191) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decisionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAmount" DECIMAL(12,2),
    "adminApprovedAt" TIMESTAMP(3),
    "adminApprovedById" VARCHAR(191),
    "treasurerApprovedAt" TIMESTAMP(3),
    "treasurerApprovedById" VARCHAR(191),
    "rejectedById" VARCHAR(191),
    "disbursedAt" TIMESTAMP(3),
    "disbursedById" VARCHAR(191),

    CONSTRAINT "EmergencyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" VARCHAR(191) NOT NULL,
    "memberId" VARCHAR(191) NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "actorId" VARCHAR(191),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankStatement" (
    "id" VARCHAR(191) NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "statementType" VARCHAR(32) NOT NULL,
    "statementDate" TIMESTAMP(3),
    "statementPeriod" TEXT,
    "uploadedById" VARCHAR(191),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" BYTEA,

    CONSTRAINT "BankStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoverningDocument" (
    "id" VARCHAR(191) NOT NULL,
    "title" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uploadedById" VARCHAR(191),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sizeBytes" INTEGER NOT NULL,
    "data" BYTEA,

    CONSTRAINT "GoverningDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunitySettings" (
    "id" VARCHAR(191) NOT NULL DEFAULT 'community',
    "warningAfterMonths" INTEGER NOT NULL DEFAULT 3,
    "closeAfterMonths" INTEGER NOT NULL DEFAULT 6,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunitySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" VARCHAR(191) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" VARCHAR(191) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    "type" TEXT NOT NULL,
    "provider" VARCHAR(255) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" VARCHAR(191) NOT NULL,
    "sessionToken" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "MemberStatusChangeRequest" (
    "id" VARCHAR(191) NOT NULL,
    "memberId" VARCHAR(191) NOT NULL,
    "currentStatus" VARCHAR(32) NOT NULL,
    "requestedStatus" VARCHAR(32) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    "requestedById" VARCHAR(191) NOT NULL,
    "adminApprovedAt" TIMESTAMP(3),
    "adminApprovedById" VARCHAR(191),
    "treasurerApprovedAt" TIMESTAMP(3),
    "treasurerApprovedById" VARCHAR(191),
    "rejectedAt" TIMESTAMP(3),
    "rejectedById" VARCHAR(191),
    "appliedAt" TIMESTAMP(3),
    "appliedById" VARCHAR(191),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberStatusChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_name_idx" ON "User"("role", "name");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- CreateIndex
CREATE INDEX "User_accessRoleId_idx" ON "User"("accessRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "AccessRole_key_key" ON "AccessRole"("key");

-- CreateIndex
CREATE INDEX "AccessRole_isSystem_name_idx" ON "AccessRole"("isSystem", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "Permission_module_name_idx" ON "Permission"("module", "name");

-- CreateIndex
CREATE INDEX "AccessRolePermission_permissionId_idx" ON "AccessRolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "AccessRolePermission_roleId_permissionId_key" ON "AccessRolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "Contribution_memberId_contributionDate_idx" ON "Contribution"("memberId", "contributionDate");

-- CreateIndex
CREATE INDEX "Contribution_createdAt_idx" ON "Contribution"("createdAt");

-- CreateIndex
CREATE INDEX "Contribution_approvalStatus_contributionDate_idx" ON "Contribution"("approvalStatus", "contributionDate");

-- CreateIndex
CREATE INDEX "Contribution_approvedById_idx" ON "Contribution"("approvedById");

-- CreateIndex
CREATE INDEX "Contribution_rejectedById_idx" ON "Contribution"("rejectedById");

-- CreateIndex
CREATE INDEX "Withdrawal_memberId_withdrawalDate_idx" ON "Withdrawal"("memberId", "withdrawalDate");

-- CreateIndex
CREATE INDEX "Withdrawal_purpose_idx" ON "Withdrawal"("purpose");

-- CreateIndex
CREATE INDEX "Withdrawal_createdAt_idx" ON "Withdrawal"("createdAt");

-- CreateIndex
CREATE INDEX "EmergencyRequest_memberId_requestDate_idx" ON "EmergencyRequest"("memberId", "requestDate");

-- CreateIndex
CREATE INDEX "EmergencyRequest_status_requestDate_idx" ON "EmergencyRequest"("status", "requestDate");

-- CreateIndex
CREATE INDEX "EmergencyRequest_adminApprovedById_idx" ON "EmergencyRequest"("adminApprovedById");

-- CreateIndex
CREATE INDEX "EmergencyRequest_treasurerApprovedById_idx" ON "EmergencyRequest"("treasurerApprovedById");

-- CreateIndex
CREATE INDEX "EmergencyRequest_rejectedById_idx" ON "EmergencyRequest"("rejectedById");

-- CreateIndex
CREATE INDEX "EmergencyRequest_disbursedById_idx" ON "EmergencyRequest"("disbursedById");

-- CreateIndex
CREATE INDEX "Transaction_memberId_type_eventDate_idx" ON "Transaction"("memberId", "type", "eventDate");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "BankStatement_createdAt_idx" ON "BankStatement"("createdAt");

-- CreateIndex
CREATE INDEX "GoverningDocument_isActive_createdAt_idx" ON "GoverningDocument"("isActive", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_expires_idx" ON "Session"("userId", "expires");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "MemberStatusChangeRequest_memberId_status_createdAt_idx" ON "MemberStatusChangeRequest"("memberId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "MemberStatusChangeRequest_requestedById_idx" ON "MemberStatusChangeRequest"("requestedById");

-- CreateIndex
CREATE INDEX "MemberStatusChangeRequest_adminApprovedById_idx" ON "MemberStatusChangeRequest"("adminApprovedById");

-- CreateIndex
CREATE INDEX "MemberStatusChangeRequest_treasurerApprovedById_idx" ON "MemberStatusChangeRequest"("treasurerApprovedById");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accessRoleId_fkey" FOREIGN KEY ("accessRoleId") REFERENCES "AccessRole"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AccessRolePermission" ADD CONSTRAINT "AccessRolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AccessRolePermission" ADD CONSTRAINT "AccessRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AccessRole"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EmergencyRequest" ADD CONSTRAINT "EmergencyRequest_adminApprovedById_fkey" FOREIGN KEY ("adminApprovedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EmergencyRequest" ADD CONSTRAINT "EmergencyRequest_disbursedById_fkey" FOREIGN KEY ("disbursedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EmergencyRequest" ADD CONSTRAINT "EmergencyRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EmergencyRequest" ADD CONSTRAINT "EmergencyRequest_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EmergencyRequest" ADD CONSTRAINT "EmergencyRequest_treasurerApprovedById_fkey" FOREIGN KEY ("treasurerApprovedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BankStatement" ADD CONSTRAINT "BankStatement_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GoverningDocument" ADD CONSTRAINT "GoverningDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MemberStatusChangeRequest" ADD CONSTRAINT "MemberStatusChangeRequest_adminApprovedById_fkey" FOREIGN KEY ("adminApprovedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MemberStatusChangeRequest" ADD CONSTRAINT "MemberStatusChangeRequest_appliedById_fkey" FOREIGN KEY ("appliedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MemberStatusChangeRequest" ADD CONSTRAINT "MemberStatusChangeRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MemberStatusChangeRequest" ADD CONSTRAINT "MemberStatusChangeRequest_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MemberStatusChangeRequest" ADD CONSTRAINT "MemberStatusChangeRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MemberStatusChangeRequest" ADD CONSTRAINT "MemberStatusChangeRequest_treasurerApprovedById_fkey" FOREIGN KEY ("treasurerApprovedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
