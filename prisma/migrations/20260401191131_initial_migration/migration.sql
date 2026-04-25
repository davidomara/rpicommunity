-- Baseline rebuilt for SQL Server from the current Prisma schema.
-- Later historical migration files are retained as intentional no-ops so
-- Prisma shadow databases apply a consistent SQL Server history.

BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] VARCHAR(191) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [username] VARCHAR(255) NOT NULL,
    [email] VARCHAR(255) NOT NULL,
    [passwordHash] NVARCHAR(1000) NOT NULL,
    [role] VARCHAR(32) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'MEMBER',
    [accessRoleId] VARCHAR(191),
    [status] VARCHAR(32) NOT NULL CONSTRAINT [User_status_df] DEFAULT 'ACTIVE',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [statusMode] VARCHAR(32) NOT NULL CONSTRAINT [User_statusMode_df] DEFAULT 'AUTO',
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_username_key] UNIQUE NONCLUSTERED ([username]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[AccessRole] (
    [id] VARCHAR(191) NOT NULL,
    [key] VARCHAR(64) NOT NULL,
    [name] VARCHAR(128) NOT NULL,
    [description] NVARCHAR(1000),
    [isSystem] BIT NOT NULL CONSTRAINT [AccessRole_isSystem_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AccessRole_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [AccessRole_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AccessRole_key_key] UNIQUE NONCLUSTERED ([key])
);

-- CreateTable
CREATE TABLE [dbo].[Permission] (
    [id] VARCHAR(191) NOT NULL,
    [key] VARCHAR(128) NOT NULL,
    [module] VARCHAR(64) NOT NULL,
    [name] VARCHAR(128) NOT NULL,
    [description] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Permission_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Permission_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Permission_key_key] UNIQUE NONCLUSTERED ([key])
);

-- CreateTable
CREATE TABLE [dbo].[AccessRolePermission] (
    [id] VARCHAR(191) NOT NULL,
    [roleId] VARCHAR(191) NOT NULL,
    [permissionId] VARCHAR(191) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AccessRolePermission_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [AccessRolePermission_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AccessRolePermission_roleId_permissionId_key] UNIQUE NONCLUSTERED ([roleId],[permissionId])
);

-- CreateTable
CREATE TABLE [dbo].[Contribution] (
    [id] VARCHAR(191) NOT NULL,
    [memberId] VARCHAR(191) NOT NULL,
    [amount] DECIMAL(12,2) NOT NULL,
    [contributionDate] DATETIME2 NOT NULL,
    [createdById] VARCHAR(191),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Contribution_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [approvalStatus] VARCHAR(32) NOT NULL CONSTRAINT [Contribution_approvalStatus_df] DEFAULT 'APPROVED',
    [approvedAt] DATETIME2,
    [approvedById] VARCHAR(191),
    [rejectedAt] DATETIME2,
    [rejectedById] VARCHAR(191),
    CONSTRAINT [Contribution_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Withdrawal] (
    [id] VARCHAR(191) NOT NULL,
    [memberId] VARCHAR(191) NOT NULL,
    [amount] DECIMAL(12,2) NOT NULL,
    [reason] NVARCHAR(1000) NOT NULL,
    [withdrawalDate] DATETIME2 NOT NULL,
    [createdById] VARCHAR(191),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Withdrawal_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Withdrawal_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EmergencyRequest] (
    [id] VARCHAR(191) NOT NULL,
    [memberId] VARCHAR(191) NOT NULL,
    [amount] DECIMAL(12,2) NOT NULL,
    [reason] NVARCHAR(1000) NOT NULL,
    [status] VARCHAR(32) NOT NULL CONSTRAINT [EmergencyRequest_status_df] DEFAULT 'PENDING',
    [requestDate] DATETIME2 NOT NULL CONSTRAINT [EmergencyRequest_requestDate_df] DEFAULT CURRENT_TIMESTAMP,
    [decisionDate] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [EmergencyRequest_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [approvedAmount] DECIMAL(12,2),
    [adminApprovedAt] DATETIME2,
    [adminApprovedById] VARCHAR(191),
    [treasurerApprovedAt] DATETIME2,
    [treasurerApprovedById] VARCHAR(191),
    [rejectedById] VARCHAR(191),
    [disbursedAt] DATETIME2,
    [disbursedById] VARCHAR(191),
    CONSTRAINT [EmergencyRequest_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Transaction] (
    [id] VARCHAR(191) NOT NULL,
    [memberId] VARCHAR(191) NOT NULL,
    [type] VARCHAR(32) NOT NULL,
    [amount] DECIMAL(12,2) NOT NULL,
    [eventDate] DATETIME2 NOT NULL,
    [notes] NVARCHAR(1000),
    [actorId] VARCHAR(191),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Transaction_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Transaction_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[BankStatement] (
    [id] VARCHAR(191) NOT NULL,
    [filename] NVARCHAR(1000) NOT NULL,
    [originalName] NVARCHAR(1000) NOT NULL,
    [mimeType] NVARCHAR(1000) NOT NULL,
    [sizeBytes] INT NOT NULL,
    [storagePath] NVARCHAR(1000) NOT NULL,
    [statementType] VARCHAR(32) NOT NULL,
    [statementDate] DATETIME2,
    [statementPeriod] NVARCHAR(1000),
    [uploadedById] VARCHAR(191),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [BankStatement_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [data] VARBINARY(max),
    CONSTRAINT [BankStatement_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[GoverningDocument] (
    [id] VARCHAR(191) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [filename] NVARCHAR(1000) NOT NULL,
    [originalName] NVARCHAR(1000) NOT NULL,
    [mimeType] NVARCHAR(1000) NOT NULL,
    [storagePath] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [GoverningDocument_isActive_df] DEFAULT 1,
    [uploadedById] VARCHAR(191),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [GoverningDocument_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [sizeBytes] INT NOT NULL,
    [data] VARBINARY(max),
    CONSTRAINT [GoverningDocument_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[CommunitySettings] (
    [id] VARCHAR(191) NOT NULL CONSTRAINT [CommunitySettings_id_df] DEFAULT 'community',
    [warningAfterMonths] INT NOT NULL CONSTRAINT [CommunitySettings_warningAfterMonths_df] DEFAULT 3,
    [closeAfterMonths] INT NOT NULL CONSTRAINT [CommunitySettings_closeAfterMonths_df] DEFAULT 6,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CommunitySettings_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [CommunitySettings_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PasswordResetToken] (
    [id] VARCHAR(191) NOT NULL,
    [token] VARCHAR(255) NOT NULL,
    [userId] VARCHAR(191) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [usedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PasswordResetToken_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PasswordResetToken_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PasswordResetToken_token_key] UNIQUE NONCLUSTERED ([token])
);

-- CreateTable
CREATE TABLE [dbo].[Account] (
    [id] VARCHAR(191) NOT NULL,
    [userId] VARCHAR(191) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [provider] VARCHAR(255) NOT NULL,
    [providerAccountId] VARCHAR(255) NOT NULL,
    [refresh_token] NVARCHAR(1000),
    [access_token] NVARCHAR(1000),
    [expires_at] INT,
    [token_type] NVARCHAR(1000),
    [scope] NVARCHAR(1000),
    [id_token] NVARCHAR(1000),
    [session_state] NVARCHAR(1000),
    CONSTRAINT [Account_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Account_provider_providerAccountId_key] UNIQUE NONCLUSTERED ([provider],[providerAccountId])
);

-- CreateTable
CREATE TABLE [dbo].[Session] (
    [id] VARCHAR(191) NOT NULL,
    [sessionToken] VARCHAR(255) NOT NULL,
    [userId] VARCHAR(191) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [Session_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Session_sessionToken_key] UNIQUE NONCLUSTERED ([sessionToken])
);

-- CreateTable
CREATE TABLE [dbo].[VerificationToken] (
    [identifier] VARCHAR(255) NOT NULL,
    [token] VARCHAR(255) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [VerificationToken_token_key] UNIQUE NONCLUSTERED ([token]),
    CONSTRAINT [VerificationToken_identifier_token_key] UNIQUE NONCLUSTERED ([identifier],[token])
);

-- CreateTable
CREATE TABLE [dbo].[MemberStatusChangeRequest] (
    [id] VARCHAR(191) NOT NULL,
    [memberId] VARCHAR(191) NOT NULL,
    [currentStatus] VARCHAR(32) NOT NULL,
    [requestedStatus] VARCHAR(32) NOT NULL,
    [status] VARCHAR(32) NOT NULL CONSTRAINT [MemberStatusChangeRequest_status_df] DEFAULT 'PENDING',
    [requestedById] VARCHAR(191) NOT NULL,
    [adminApprovedAt] DATETIME2,
    [adminApprovedById] VARCHAR(191),
    [treasurerApprovedAt] DATETIME2,
    [treasurerApprovedById] VARCHAR(191),
    [rejectedAt] DATETIME2,
    [rejectedById] VARCHAR(191),
    [appliedAt] DATETIME2,
    [appliedById] VARCHAR(191),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [MemberStatusChangeRequest_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [MemberStatusChangeRequest_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [User_role_name_idx] ON [dbo].[User]([role], [name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [User_role_status_idx] ON [dbo].[User]([role], [status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [User_accessRoleId_idx] ON [dbo].[User]([accessRoleId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AccessRole_isSystem_name_idx] ON [dbo].[AccessRole]([isSystem], [name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Permission_module_name_idx] ON [dbo].[Permission]([module], [name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AccessRolePermission_permissionId_idx] ON [dbo].[AccessRolePermission]([permissionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Contribution_memberId_contributionDate_idx] ON [dbo].[Contribution]([memberId], [contributionDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Contribution_createdAt_idx] ON [dbo].[Contribution]([createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Contribution_approvalStatus_contributionDate_idx] ON [dbo].[Contribution]([approvalStatus], [contributionDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Contribution_approvedById_idx] ON [dbo].[Contribution]([approvedById]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Contribution_rejectedById_idx] ON [dbo].[Contribution]([rejectedById]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Withdrawal_memberId_withdrawalDate_idx] ON [dbo].[Withdrawal]([memberId], [withdrawalDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Withdrawal_createdAt_idx] ON [dbo].[Withdrawal]([createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EmergencyRequest_memberId_requestDate_idx] ON [dbo].[EmergencyRequest]([memberId], [requestDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EmergencyRequest_status_requestDate_idx] ON [dbo].[EmergencyRequest]([status], [requestDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EmergencyRequest_adminApprovedById_idx] ON [dbo].[EmergencyRequest]([adminApprovedById]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EmergencyRequest_treasurerApprovedById_idx] ON [dbo].[EmergencyRequest]([treasurerApprovedById]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EmergencyRequest_rejectedById_idx] ON [dbo].[EmergencyRequest]([rejectedById]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EmergencyRequest_disbursedById_idx] ON [dbo].[EmergencyRequest]([disbursedById]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Transaction_memberId_type_eventDate_idx] ON [dbo].[Transaction]([memberId], [type], [eventDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Transaction_createdAt_idx] ON [dbo].[Transaction]([createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [BankStatement_createdAt_idx] ON [dbo].[BankStatement]([createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [GoverningDocument_isActive_createdAt_idx] ON [dbo].[GoverningDocument]([isActive], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PasswordResetToken_userId_expiresAt_idx] ON [dbo].[PasswordResetToken]([userId], [expiresAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Session_userId_expires_idx] ON [dbo].[Session]([userId], [expires]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [MemberStatusChangeRequest_memberId_status_createdAt_idx] ON [dbo].[MemberStatusChangeRequest]([memberId], [status], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [MemberStatusChangeRequest_requestedById_idx] ON [dbo].[MemberStatusChangeRequest]([requestedById]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [MemberStatusChangeRequest_adminApprovedById_idx] ON [dbo].[MemberStatusChangeRequest]([adminApprovedById]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [MemberStatusChangeRequest_treasurerApprovedById_idx] ON [dbo].[MemberStatusChangeRequest]([treasurerApprovedById]);

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_accessRoleId_fkey] FOREIGN KEY ([accessRoleId]) REFERENCES [dbo].[AccessRole]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AccessRolePermission] ADD CONSTRAINT [AccessRolePermission_permissionId_fkey] FOREIGN KEY ([permissionId]) REFERENCES [dbo].[Permission]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AccessRolePermission] ADD CONSTRAINT [AccessRolePermission_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[AccessRole]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Contribution] ADD CONSTRAINT [Contribution_approvedById_fkey] FOREIGN KEY ([approvedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Contribution] ADD CONSTRAINT [Contribution_createdById_fkey] FOREIGN KEY ([createdById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Contribution] ADD CONSTRAINT [Contribution_memberId_fkey] FOREIGN KEY ([memberId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Contribution] ADD CONSTRAINT [Contribution_rejectedById_fkey] FOREIGN KEY ([rejectedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Withdrawal] ADD CONSTRAINT [Withdrawal_createdById_fkey] FOREIGN KEY ([createdById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Withdrawal] ADD CONSTRAINT [Withdrawal_memberId_fkey] FOREIGN KEY ([memberId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmergencyRequest] ADD CONSTRAINT [EmergencyRequest_adminApprovedById_fkey] FOREIGN KEY ([adminApprovedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmergencyRequest] ADD CONSTRAINT [EmergencyRequest_disbursedById_fkey] FOREIGN KEY ([disbursedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmergencyRequest] ADD CONSTRAINT [EmergencyRequest_memberId_fkey] FOREIGN KEY ([memberId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmergencyRequest] ADD CONSTRAINT [EmergencyRequest_rejectedById_fkey] FOREIGN KEY ([rejectedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmergencyRequest] ADD CONSTRAINT [EmergencyRequest_treasurerApprovedById_fkey] FOREIGN KEY ([treasurerApprovedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Transaction] ADD CONSTRAINT [Transaction_actorId_fkey] FOREIGN KEY ([actorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Transaction] ADD CONSTRAINT [Transaction_memberId_fkey] FOREIGN KEY ([memberId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[BankStatement] ADD CONSTRAINT [BankStatement_uploadedById_fkey] FOREIGN KEY ([uploadedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[GoverningDocument] ADD CONSTRAINT [GoverningDocument_uploadedById_fkey] FOREIGN KEY ([uploadedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PasswordResetToken] ADD CONSTRAINT [PasswordResetToken_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Account] ADD CONSTRAINT [Account_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Session] ADD CONSTRAINT [Session_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MemberStatusChangeRequest] ADD CONSTRAINT [MemberStatusChangeRequest_adminApprovedById_fkey] FOREIGN KEY ([adminApprovedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MemberStatusChangeRequest] ADD CONSTRAINT [MemberStatusChangeRequest_appliedById_fkey] FOREIGN KEY ([appliedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MemberStatusChangeRequest] ADD CONSTRAINT [MemberStatusChangeRequest_memberId_fkey] FOREIGN KEY ([memberId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MemberStatusChangeRequest] ADD CONSTRAINT [MemberStatusChangeRequest_rejectedById_fkey] FOREIGN KEY ([rejectedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MemberStatusChangeRequest] ADD CONSTRAINT [MemberStatusChangeRequest_requestedById_fkey] FOREIGN KEY ([requestedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MemberStatusChangeRequest] ADD CONSTRAINT [MemberStatusChangeRequest_treasurerApprovedById_fkey] FOREIGN KEY ([treasurerApprovedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
