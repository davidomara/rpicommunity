import bcrypt from "bcryptjs";
import { EmergencyStatus, MemberStatus, PrismaClient, Role, StatementType, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

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

  const admin = await prisma.user.create({
    data: {
      name: "RPIC Community Admin",
      username: "admin",
      email: "admin@rpic.local",
      passwordHash,
      role: Role.ADMIN,
      status: MemberStatus.ACTIVE
    }
  });

  const members = await Promise.all([
    prisma.user.create({
      data: {
        name: "Alice Namayanja",
        username: "alice",
        email: "alice@rpic.local",
        passwordHash: memberHash,
        role: Role.MEMBER,
        status: MemberStatus.ACTIVE
      }
    }),
    prisma.user.create({
      data: {
        name: "Brian Okello",
        username: "brian",
        email: "brian@rpic.local",
        passwordHash: memberHash,
        role: Role.MEMBER,
        status: MemberStatus.WARNING
      }
    }),
    prisma.user.create({
      data: {
        name: "Catherine Auma",
        username: "catherine",
        email: "catherine@rpic.local",
        passwordHash: memberHash,
        role: Role.MEMBER,
        status: MemberStatus.ACTIVE
      }
    })
  ]);

  for (const [index, member] of members.entries()) {
    const contribution = await prisma.contribution.create({
      data: {
        memberId: member.id,
        amount: 150000 + index * 25000,
        contributionDate: new Date(`2026-0${index + 1}-15T00:00:00.000Z`),
        createdById: admin.id
      }
    });

    await prisma.transaction.create({
      data: {
        memberId: member.id,
        type: TransactionType.CONTRIBUTION,
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
      type: TransactionType.WITHDRAWAL,
      amount: withdrawal.amount,
      eventDate: withdrawal.withdrawalDate,
      actorId: admin.id,
      notes: withdrawal.reason
    }
  });

  await prisma.emergencyRequest.createMany({
    data: [
      {
        memberId: members[0].id,
        amount: 200000,
        reason: "Emergency medical bill support",
        status: EmergencyStatus.PENDING,
        requestDate: new Date("2026-03-18T00:00:00.000Z")
      },
      {
        memberId: members[2].id,
        amount: 120000,
        reason: "Funeral contribution support",
        status: EmergencyStatus.APPROVED,
        requestDate: new Date("2026-02-22T00:00:00.000Z"),
        decisionDate: new Date("2026-02-24T00:00:00.000Z"),
        decidedById: admin.id
      }
    ]
  });

  console.log("Seeded RPIC Community demo data");
  console.log("Admin login: admin / Admin@123");
  console.log("Member login: alice / Member@123");
}

main().finally(async () => {
  await prisma.$disconnect();
});
