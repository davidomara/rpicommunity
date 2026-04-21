ALTER TABLE [dbo].[User] ADD [accessRoleId] VARCHAR(191);
GO

CREATE TABLE [dbo].[AccessRole] (
  [id] VARCHAR(191) NOT NULL,
  [key] VARCHAR(64) NOT NULL,
  [name] VARCHAR(128) NOT NULL,
  [description] VARCHAR(1000),
  [isSystem] BIT NOT NULL CONSTRAINT [AccessRole_isSystem_df] DEFAULT 1,
  [createdAt] DATETIME2 NOT NULL CONSTRAINT [AccessRole_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
  [updatedAt] DATETIME2 NOT NULL,
  CONSTRAINT [AccessRole_pkey] PRIMARY KEY CLUSTERED ([id]),
  CONSTRAINT [AccessRole_key_key] UNIQUE NONCLUSTERED ([key])
);
GO

CREATE TABLE [dbo].[Permission] (
  [id] VARCHAR(191) NOT NULL,
  [key] VARCHAR(128) NOT NULL,
  [module] VARCHAR(64) NOT NULL,
  [name] VARCHAR(128) NOT NULL,
  [description] VARCHAR(1000),
  [createdAt] DATETIME2 NOT NULL CONSTRAINT [Permission_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
  [updatedAt] DATETIME2 NOT NULL,
  CONSTRAINT [Permission_pkey] PRIMARY KEY CLUSTERED ([id]),
  CONSTRAINT [Permission_key_key] UNIQUE NONCLUSTERED ([key])
);
GO

CREATE TABLE [dbo].[AccessRolePermission] (
  [id] VARCHAR(191) NOT NULL,
  [roleId] VARCHAR(191) NOT NULL,
  [permissionId] VARCHAR(191) NOT NULL,
  [createdAt] DATETIME2 NOT NULL CONSTRAINT [AccessRolePermission_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT [AccessRolePermission_pkey] PRIMARY KEY CLUSTERED ([id]),
  CONSTRAINT [AccessRolePermission_roleId_permissionId_key] UNIQUE NONCLUSTERED ([roleId], [permissionId])
);
GO

CREATE INDEX [User_accessRoleId_idx] ON [dbo].[User]([accessRoleId]);
GO

CREATE INDEX [AccessRole_isSystem_name_idx] ON [dbo].[AccessRole]([isSystem], [name]);
GO

CREATE INDEX [Permission_module_name_idx] ON [dbo].[Permission]([module], [name]);
GO

CREATE INDEX [AccessRolePermission_permissionId_idx] ON [dbo].[AccessRolePermission]([permissionId]);
GO

ALTER TABLE [dbo].[User]
  ADD CONSTRAINT [User_accessRoleId_fkey]
  FOREIGN KEY ([accessRoleId]) REFERENCES [dbo].[AccessRole]([id])
  ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

ALTER TABLE [dbo].[AccessRolePermission]
  ADD CONSTRAINT [AccessRolePermission_roleId_fkey]
  FOREIGN KEY ([roleId]) REFERENCES [dbo].[AccessRole]([id])
  ON DELETE CASCADE ON UPDATE NO ACTION;
GO

ALTER TABLE [dbo].[AccessRolePermission]
  ADD CONSTRAINT [AccessRolePermission_permissionId_fkey]
  FOREIGN KEY ([permissionId]) REFERENCES [dbo].[Permission]([id])
  ON DELETE CASCADE ON UPDATE NO ACTION;
GO
