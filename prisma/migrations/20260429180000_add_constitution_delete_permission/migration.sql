DECLARE @permissionId VARCHAR(191);

SELECT @permissionId = [id]
FROM [dbo].[Permission]
WHERE [key] = 'constitution.delete';

IF @permissionId IS NULL
BEGIN
    SET @permissionId = CONCAT('perm_', REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''));

    INSERT INTO [dbo].[Permission] ([id], [key], [module], [name], [description], [createdAt], [updatedAt])
    VALUES (
        @permissionId,
        'constitution.delete',
        'constitution',
        'Delete Constitution Documents',
        'Delete governing constitution documents.',
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );
END;

INSERT INTO [dbo].[AccessRolePermission] ([id], [roleId], [permissionId], [createdAt])
SELECT
    CONCAT('arp_', REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', '')),
    [role].[id],
    @permissionId,
    SYSUTCDATETIME()
FROM [dbo].[AccessRole] AS [role]
WHERE [role].[key] IN ('SUPER_ADMIN', 'ADMIN')
  AND NOT EXISTS (
      SELECT 1
      FROM [dbo].[AccessRolePermission] AS [rolePermission]
      WHERE [rolePermission].[roleId] = [role].[id]
        AND [rolePermission].[permissionId] = @permissionId
  );
