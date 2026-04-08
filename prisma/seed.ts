import bcrypt from "bcryptjs";
import { MemberStatus, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const rankPrefixes = new Set(["CP", "SSP", "SP", "ASP", "AIP", "CPL", "PC"]);

const onboardingMembers: Array<{
  name: string;
  role: Role;
  username?: string;
  email?: string;
}> = [
  { name: "CP Munanura Dan", role: Role.ADMIN, username: "admin", email: "admin@rpic.local" },
  { name: "SSP Ssenyondo Richard", role: Role.MEMBER },
  { name: "SSP Epedu David", role: Role.MEMBER },
  { name: "SP Mutaasa Ivan", role: Role.MEMBER },
  { name: "SP Ayebaze Lee", role: Role.MEMBER },
  { name: "SP Kedi Betty", role: Role.TREASURER, username: "treasurer", email: "treasurer@rpic.local" },
  { name: "SP Kitimbo Daniel", role: Role.MEMBER },
  { name: "SP NiringiYimana Gideon", role: Role.MEMBER },
  { name: "SP Mukembo Joel", role: Role.MEMBER },
  { name: "SP Emukadde Emmanuel", role: Role.MEMBER },
  { name: "SP Etene Moses", role: Role.MEMBER },
  { name: "SP Naggayi Sophie Kaggwa", role: Role.MEMBER },
  { name: "SP Arinda Nickson", role: Role.MEMBER },
  { name: "SP Wampamba Jacob", role: Role.MEMBER },
  { name: "SP Mugabe K Peter", role: Role.MEMBER },
  { name: "SP Mafuko George", role: Role.MEMBER },
  { name: "ASP Ogwal Morish", role: Role.MEMBER },
  { name: "ASP Malinga John", role: Role.MEMBER },
  { name: "ASP Twesigye Fred", role: Role.MEMBER },
  { name: "ASP Musinguzi Benson", role: Role.MEMBER },
  { name: "AIP Mubbala Paul", role: Role.MEMBER },
  { name: "AIP Kalyebi Brian", role: Role.MEMBER },
  { name: "AIP Draciri James Raymond", role: Role.MEMBER },
  { name: "AIP Mukama Jovita Jason", role: Role.MEMBER },
  { name: "AIP Ayima Bonny", role: Role.MEMBER },
  { name: "AIP Kamunanwire Elvis", role: Role.MEMBER },
  { name: "AIP Fagiyo Juma", role: Role.MEMBER },
  { name: "AIP Emudong Daniel William", role: Role.MEMBER },
  { name: "AIP Lutaaya George", role: Role.MEMBER },
  { name: "AIP Egesu Eryau Henry", role: Role.MEMBER },
  { name: "AIP Balikowa Bosco", role: Role.MEMBER },
  { name: "AIP Omara David Owiny", role: Role.MEMBER },
  { name: "AIP Akumu Phiona", role: Role.MEMBER },
  { name: "AIP Omuut Francis", role: Role.MEMBER },
  { name: "AIP Nuwasasira Abel", role: Role.MEMBER },
  { name: "AIP Ssuuna Henry", role: Role.MEMBER },
  { name: "AIP Nakajubi Rebecca", role: Role.MEMBER },
  { name: "AIP Mugizi Adrian", role: Role.MEMBER },
  { name: "AIP Etyang Rowling Jerry", role: Role.MEMBER },
  { name: "AIP Olanya Geoffrey", role: Role.MEMBER },
  { name: "AIP Kibet Victor", role: Role.MEMBER },
  { name: "AIP Akampwera Bannet", role: Role.MEMBER },
  { name: "AIP Abalonde Noah", role: Role.MEMBER },
  { name: "AIP Auma Ceazeria", role: Role.MEMBER },
  { name: "AIP Magezi John Paul", role: Role.MEMBER },
  { name: "AIP Kidandi Remmy", role: Role.MEMBER },
  { name: "CPL Tasamba Boyi Balamu", role: Role.MEMBER },
  { name: "PC Ayebare B Godfrey", role: Role.MEMBER }
];

function stripRank(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1 && rankPrefixes.has(parts[0].toUpperCase())) {
    return parts.slice(1).join(" ");
  }
  return name.trim();
}

function slugPart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".");
}

function createCredentials(name: string, used: Set<string>) {
  const baseName = stripRank(name);
  const parts = baseName.split(/\s+/).filter(Boolean);
  const first = slugPart(parts[0] || baseName);
  const last = slugPart(parts[parts.length - 1] || baseName);
  const full = slugPart(baseName);

  const candidates = [full, `${first}.${last}`, first].filter(Boolean);

  for (const candidate of candidates) {
    if (!used.has(candidate)) {
      used.add(candidate);
      return {
        username: candidate,
        email: `${candidate}@rpic.local`
      };
    }
  }

  let suffix = 2;
  while (used.has(`${full}.${suffix}`)) {
    suffix += 1;
  }

  const username = `${full}.${suffix}`;
  used.add(username);
  return {
    username,
    email: `${username}@rpic.local`
  };
}

async function main() {
  const adminHash = await bcrypt.hash("Admin@123", 12);
  const memberHash = await bcrypt.hash("Member@123", 12);
  const usedUsernames = new Set<string>();

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

  for (const person of onboardingMembers) {
    const generated = person.username && person.email
      ? { username: person.username, email: person.email }
      : createCredentials(person.name, usedUsernames);

    usedUsernames.add(generated.username);

    await prisma.user.create({
      data: {
        name: person.name,
        username: generated.username,
        email: generated.email,
        passwordHash: person.role === Role.MEMBER ? memberHash : adminHash,
        role: person.role,
        status: MemberStatus.ACTIVE
      }
    });
  }

  console.log(`Seeded RPIC Community onboarding users: ${onboardingMembers.length}`);
  console.log("Admin login: admin / Admin@123");
  console.log("Treasurer login: treasurer / Admin@123");
  console.log("All other onboarded members use: Member@123");
}

main().finally(async () => {
  await prisma.$disconnect();
});
