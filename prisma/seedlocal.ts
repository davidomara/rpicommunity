import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { deriveLegacyAccessRoleKey, getPermissionDefinitions, getSeedAccessRoles } from "@/lib/rbac-core";

const prisma = new PrismaClient();
type Role = "ADMIN" | "MEMBER" | "TREASURER";
type MemberStatus = "ACTIVE" | "WARNING" | "CLOSED";
type EmergencyStatus = "PENDING" | "APPROVED" | "REJECTED";
type TransactionType = "CONTRIBUTION" | "WITHDRAWAL";

const ROLE = {
  ADMIN: "ADMIN" as Role,
  MEMBER: "MEMBER" as Role,
  TREASURER: "TREASURER" as Role
};

const MEMBER_STATUS = {
  ACTIVE: "ACTIVE" as MemberStatus,
  WARNING: "WARNING" as MemberStatus,
  CLOSED: "CLOSED" as MemberStatus
};

const EMERGENCY_STATUS = {
  PENDING: "PENDING" as EmergencyStatus,
  APPROVED: "APPROVED" as EmergencyStatus,
  REJECTED: "REJECTED" as EmergencyStatus
};

const TRANSACTION_TYPE = {
  CONTRIBUTION: "CONTRIBUTION" as TransactionType,
  WITHDRAWAL: "WITHDRAWAL" as TransactionType
};

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);
  const memberHash = await bcrypt.hash("Member@123", 12);

  await prisma.transaction.deleteMany();
  await prisma.emergencyRequest.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.bankStatement.deleteMany();
  await prisma.governingDocument.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.accessRolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.accessRole.deleteMany();

  const permissionRows = getPermissionDefinitions();
  await prisma.permission.createMany({
    data: permissionRows.map((permission) => ({
      key: permission.key,
      module: permission.module,
      name: permission.name,
      description: permission.description
    }))
  });

  const createdPermissions = await prisma.permission.findMany({
    select: { id: true, key: true }
  });
  const permissionIdByKey = new Map(createdPermissions.map((permission) => [permission.key, permission.id]));

  const seedRoles = getSeedAccessRoles();
  await prisma.accessRole.createMany({
    data: seedRoles.map((role) => ({
      key: role.key,
      name: role.name,
      description: role.description,
      isSystem: true
    }))
  });

  const createdAccessRoles = await prisma.accessRole.findMany({
    select: { id: true, key: true }
  });
  const accessRoleIdByKey = new Map(createdAccessRoles.map((role) => [role.key, role.id]));

  await prisma.accessRolePermission.createMany({
    data: seedRoles.flatMap((role) =>
      role.permissions
        .map((permissionKey) => {
          const roleId = accessRoleIdByKey.get(role.key);
          const permissionId = permissionIdByKey.get(permissionKey);
          if (!roleId || !permissionId) return null;

          return {
            roleId,
            permissionId
          };
        })
        .filter((value): value is { roleId: string; permissionId: string } => Boolean(value))
    )
  });

  const admin = await prisma.user.create({
    data: {
      name: "RPIC Community Admin",
      username: "admin",
      email: "admin@rpic.local",
      passwordHash,
      role: ROLE.ADMIN,
      accessRoleId: accessRoleIdByKey.get(deriveLegacyAccessRoleKey(ROLE.ADMIN)) ?? null,
      status: MEMBER_STATUS.ACTIVE
    }
  });

  const treasurer = await prisma.user.create({
    data: {
      name: "RPIC Community Treasurer",
      username: "treasurer",
      email: "treasurer@rpic.local",
      passwordHash,
      role: ROLE.TREASURER,
      accessRoleId: accessRoleIdByKey.get(deriveLegacyAccessRoleKey(ROLE.TREASURER)) ?? null,
      status: MEMBER_STATUS.ACTIVE
    }
  });

  const members = await Promise.all([
    prisma.user.create({
      data: {
        name: "Alice Namayanja",
        username: "alice",
        email: "alice@rpic.local",
        passwordHash: memberHash,
        role: ROLE.MEMBER,
        accessRoleId: accessRoleIdByKey.get(deriveLegacyAccessRoleKey(ROLE.MEMBER)) ?? null,
        status: MEMBER_STATUS.ACTIVE
      }
    }),
    prisma.user.create({
      data: {
        name: "Brian Okello",
        username: "brian",
        email: "brian@rpic.local",
        passwordHash: memberHash,
        role: ROLE.MEMBER,
        accessRoleId: accessRoleIdByKey.get(deriveLegacyAccessRoleKey(ROLE.MEMBER)) ?? null,
        status: MEMBER_STATUS.WARNING
      }
    }),
    prisma.user.create({
      data: {
        name: "Catherine Auma",
        username: "catherine",
        email: "catherine@rpic.local",
        passwordHash: memberHash,
        role: ROLE.MEMBER,
        accessRoleId: accessRoleIdByKey.get(deriveLegacyAccessRoleKey(ROLE.MEMBER)) ?? null,
        status: MEMBER_STATUS.ACTIVE
      }
    })
  ]);

  for (const [index, member] of members.entries()) {
    const contribution = await prisma.contribution.create({
      data: {
        memberId: member.id,
        amount: 150000 + index * 25000,
        contributionDate: new Date(`2026-0${index + 4}-15T00:00:00.000Z`),
        createdById: admin.id
      }
    });

    await prisma.transaction.create({
      data: {
        memberId: member.id,
        type: TRANSACTION_TYPE.CONTRIBUTION,
        amount: contribution.amount,
        eventDate: contribution.contributionDate,
        actorId: admin.id,
        notes: "Seed contribution"
      }
    });
  }

  const withdrawal = await prisma.withdrawal.create({
    data: {
      memberId: members[1].id,
      amount: 50000,
      reason: "Medical support",
      withdrawalDate: new Date("2026-03-03T00:00:00.000Z"),
      createdById: admin.id
    }
  });

  await prisma.transaction.create({
    data: {
      memberId: members[1].id,
      type: TRANSACTION_TYPE.WITHDRAWAL,
      amount: withdrawal.amount,
      eventDate: withdrawal.withdrawalDate,
      actorId: admin.id,
      notes: withdrawal.reason
    }
  });

  await prisma.emergencyRequest.create({
    data: {
      memberId: members[0].id,
      amount: 200000,
      reason: "Emergency medical bill support",
      status: EMERGENCY_STATUS.PENDING,
      requestDate: new Date("2026-03-18T00:00:00.000Z")
    }
  });

  await prisma.emergencyRequest.create({
    data: {
      memberId: members[2].id,
      amount: 120000,
      approvedAmount: 120000,
      reason: "Funeral contribution support",
      status: EMERGENCY_STATUS.APPROVED,
      requestDate: new Date("2026-02-22T00:00:00.000Z"),
      adminApprovedAt: new Date("2026-02-23T00:00:00.000Z"),
      adminApprovedById: admin.id,
      treasurerApprovedAt: new Date("2026-02-24T00:00:00.000Z"),
      treasurerApprovedById: treasurer.id,
      decisionDate: new Date("2026-02-24T00:00:00.000Z"),
      disbursedAt: new Date("2026-02-24T00:00:00.000Z"),
      disbursedById: treasurer.id
    }
  });

  console.log("Seeded RPIC Community demo data");
  console.log("Admin login: admin / Admin@123");
  console.log("Treasurer login: treasurer / Admin@123");
  console.log("Member login: alice / Member@123");
}

main().finally(async () => {
  await prisma.$disconnect();
});
