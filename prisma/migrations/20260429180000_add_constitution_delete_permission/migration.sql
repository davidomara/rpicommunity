DO $$
DECLARE
    permission_id VARCHAR(191);
BEGIN
    SELECT "id"
    INTO permission_id
    FROM "Permission"
    WHERE "key" = 'constitution.delete';

    IF permission_id IS NULL THEN
        permission_id := 'perm_' || substr(md5(random()::text || clock_timestamp()::text), 1, 25);

        INSERT INTO "Permission" ("id", "key", "module", "name", "description", "createdAt", "updatedAt")
        VALUES (
            permission_id,
            'constitution.delete',
            'constitution',
            'Delete Constitution Documents',
            'Delete governing constitution documents.',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
    END IF;

    INSERT INTO "AccessRolePermission" ("id", "roleId", "permissionId", "createdAt")
    SELECT
        'arp_' || substr(md5(random()::text || clock_timestamp()::text || role_row."id"), 1, 25),
        role_row."id",
        permission_id,
        CURRENT_TIMESTAMP
    FROM "AccessRole" AS role_row
    WHERE role_row."key" IN ('SUPER_ADMIN', 'ADMIN')
      AND NOT EXISTS (
          SELECT 1
          FROM "AccessRolePermission" AS role_permission
          WHERE role_permission."roleId" = role_row."id"
            AND role_permission."permissionId" = permission_id
      );
END $$;
