import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rankPrefixes = new Set(["CP", "SSP", "SP", "ASP", "AIP", "CPL", "PC"]);
type Role = "ADMIN" | "MEMBER" | "TREASURER";
const ROLE = {
  ADMIN: "ADMIN" as Role,
  MEMBER: "MEMBER" as Role,
  TREASURER: "TREASURER" as Role
};
const MEMBER_STATUS_ACTIVE = "ACTIVE";

const onboardingMembers: Array<{
  name: string;
  role: Role;
  username?: string;
  email?: string;
}> = [
  { name: "CP Munanura Dan", role: ROLE.ADMIN, username: "admin", email: "admin@rpic.local" },
  { name: "SSP Ssenyondo Richard", role: ROLE.MEMBER },
  { name: "SSP Epedu David", role: ROLE.MEMBER },
  { name: "SP Mutaasa Ivan", role: ROLE.MEMBER },
  { name: "SP Ayebaze Lee", role: ROLE.MEMBER },
  { name: "SP Kedi Betty", role: ROLE.TREASURER, username: "treasurer", email: "treasurer@rpic.local" },
  { name: "SP Kitimbo Daniel", role: ROLE.MEMBER },
  { name: "SP NiringiYimana Gideon", role: ROLE.MEMBER },
  { name: "SP Mukembo Joel", role: ROLE.MEMBER },
  { name: "SP Emukadde Emmanuel", role: ROLE.MEMBER },
  { name: "SP Etene Moses", role: ROLE.MEMBER },
  { name: "SP Naggayi Sophie Kaggwa", role: ROLE.MEMBER },
  { name: "SP Arinda Nickson", role: ROLE.MEMBER },
  { name: "SP Wampamba Jacob", role: ROLE.MEMBER },
  { name: "SP Mugabe K Peter", role: ROLE.MEMBER },
  { name: "SP Mafuko George", role: ROLE.MEMBER },
  { name: "ASP Ogwal Morish", role: ROLE.MEMBER },
  { name: "ASP Malinga John", role: ROLE.MEMBER },
  { name: "ASP Twesigye Fred", role: ROLE.MEMBER },
  { name: "ASP Musinguzi Benson", role: ROLE.MEMBER },
  { name: "AIP Mubbala Paul", role: ROLE.MEMBER },
  { name: "AIP Kalyebi Brian", role: ROLE.MEMBER },
  { name: "AIP Draciri James Raymond", role: ROLE.MEMBER },
  { name: "AIP Mukama Jovita Jason", role: ROLE.MEMBER },
  { name: "AIP Ayima Bonny", role: ROLE.MEMBER },
  { name: "AIP Kamunanwire Elvis", role: ROLE.MEMBER },
  { name: "AIP Fagiyo Juma", role: ROLE.MEMBER },
  { name: "AIP Emudong Daniel William", role: ROLE.MEMBER },
  { name: "AIP Lutaaya George", role: ROLE.MEMBER },
  { name: "AIP Egesu Eryau Henry", role: ROLE.MEMBER },
  { name: "AIP Balikowa Bosco", role: ROLE.MEMBER },
  { name: "AIP Omara David Owiny", role: ROLE.MEMBER },
  { name: "AIP Akumu Phiona", role: ROLE.MEMBER },
  { name: "AIP Omuut Francis", role: ROLE.MEMBER },
  { name: "AIP Nuwasasira Abel", role: ROLE.MEMBER },
  { name: "AIP Ssuuna Henry", role: ROLE.MEMBER },
  { name: "AIP Nakajubi Rebecca", role: ROLE.MEMBER },
  { name: "AIP Mugizi Adrian", role: ROLE.MEMBER },
  { name: "AIP Etyang Rowling Jerry", role: ROLE.MEMBER },
  { name: "AIP Olanya Geoffrey", role: ROLE.MEMBER },
  { name: "AIP Kibet Victor", role: ROLE.MEMBER },
  { name: "AIP Akampwera Bannet", role: ROLE.MEMBER },
  { name: "AIP Abalonde Noah", role: ROLE.MEMBER },
  { name: "AIP Auma Ceazeria", role: ROLE.MEMBER },
  { name: "AIP Magezi John Paul", role: ROLE.MEMBER },
  { name: "AIP Kidandi Remmy", role: ROLE.MEMBER },
  { name: "CPL Tasamba Boyi Balamu", role: ROLE.MEMBER },
  { name: "PC Ayebare B Godfrey", role: ROLE.MEMBER }
  { name: "CP Munanura Dan", role: ROLE.ADMIN, username: "admin", email: "admin@rpic.local" },
  { name: "SSP Ssenyondo Richard", role: ROLE.MEMBER },
  { name: "SSP Epedu David", role: ROLE.MEMBER },
  { name: "SP Mutaasa Ivan", role: ROLE.MEMBER },
  { name: "SP Ayebaze Lee", role: ROLE.MEMBER },
  { name: "SP Kedi Betty", role: ROLE.TREASURER, username: "treasurer", email: "treasurer@rpic.local" },
  { name: "SP Kitimbo Daniel", role: ROLE.MEMBER },
  { name: "SP NiringiYimana Gideon", role: ROLE.MEMBER },
  { name: "SP Mukembo Joel", role: ROLE.MEMBER },
  { name: "SP Emukadde Emmanuel", role: ROLE.MEMBER },
  { name: "SP Etene Moses", role: ROLE.MEMBER },
  { name: "SP Naggayi Sophie Kaggwa", role: ROLE.MEMBER },
  { name: "SP Arinda Nickson", role: ROLE.MEMBER },
  { name: "SP Wampamba Jacob", role: ROLE.MEMBER },
  { name: "SP Mugabe K Peter", role: ROLE.MEMBER },
  { name: "SP Mafuko George", role: ROLE.MEMBER },
  { name: "ASP Ogwal Morish", role: ROLE.MEMBER },
  { name: "ASP Malinga John", role: ROLE.MEMBER },
  { name: "ASP Twesigye Fred", role: ROLE.MEMBER },
  { name: "ASP Musinguzi Benson", role: ROLE.MEMBER },
  { name: "AIP Mubbala Paul", role: ROLE.MEMBER },
  { name: "AIP Kalyebi Brian", role: ROLE.MEMBER },
  { name: "AIP Draciri James Raymond", role: ROLE.MEMBER },
  { name: "AIP Mukama Jovita Jason", role: ROLE.MEMBER },
  { name: "AIP Ayima Bonny", role: ROLE.MEMBER },
  { name: "AIP Kamunanwire Elvis", role: ROLE.MEMBER },
  { name: "AIP Fagiyo Juma", role: ROLE.MEMBER },
  { name: "AIP Emudong Daniel William", role: ROLE.MEMBER },
  { name: "AIP Lutaaya George", role: ROLE.MEMBER },
  { name: "AIP Egesu Eryau Henry", role: ROLE.MEMBER },
  { name: "AIP Balikowa Bosco", role: ROLE.MEMBER },
  { name: "AIP Omara David Owiny", role: ROLE.MEMBER },
  { name: "AIP Akumu Phiona", role: ROLE.MEMBER },
  { name: "AIP Omuut Francis", role: ROLE.MEMBER },
  { name: "AIP Nuwasasira Abel", role: ROLE.MEMBER },
  { name: "AIP Ssuuna Henry", role: ROLE.MEMBER },
  { name: "AIP Nakajubi Rebecca", role: ROLE.MEMBER },
  { name: "AIP Mugizi Adrian", role: ROLE.MEMBER },
  { name: "AIP Etyang Rowling Jerry", role: ROLE.MEMBER },
  { name: "AIP Olanya Geoffrey", role: ROLE.MEMBER },
  { name: "AIP Kibet Victor", role: ROLE.MEMBER },
  { name: "AIP Akampwera Bannet", role: ROLE.MEMBER },
  { name: "AIP Abalonde Noah", role: ROLE.MEMBER },
  { name: "AIP Auma Ceazeria", role: ROLE.MEMBER },
  { name: "AIP Magezi John Paul", role: ROLE.MEMBER },
  { name: "AIP Kidandi Remmy", role: ROLE.MEMBER },
  { name: "CPL Tasamba Boyi Balamu", role: ROLE.MEMBER },
  { name: "PC Ayebare B Godfrey", role: ROLE.MEMBER }
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
        passwordHash: person.role === ROLE.MEMBER ? memberHash : adminHash,
        role: person.role,
        status: MEMBER_STATUS_ACTIVE
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
