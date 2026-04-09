import { prisma } from "@/lib/db";
import { getCommunitySettings } from "@/lib/community-settings";
import { resolveMemberStatus } from "@/lib/member-status";
import { Role } from "@prisma/client";

export async function syncAutoMemberStatuses() {
  const [settings, members] = await Promise.all([
    getCommunitySettings(),
    prisma.user.findMany({
      where: {
        role: { in: [Role.ADMIN, Role.TREASURER, Role.MEMBER] },
        statusMode: "AUTO"
      },
      include: {
        contributions: {
          select: { amount: true }
        }
      }
    })
  ]);

  const updates = members.reduce<ReturnType<typeof prisma.user.update>[]>((acc, member) => {
    const totalContributions = member.contributions.reduce((sum, row) => sum + Number(row.amount), 0);
    const nextStatus = resolveMemberStatus(totalContributions, settings).status;
    if (member.status !== nextStatus) {
      acc.push(prisma.user.update({
        where: { id: member.id },
        data: { status: nextStatus }
      }));
    }
    return acc;
  }, []);

  if (updates.length) {
    await prisma.$transaction(updates);
  }

  return settings;
}
