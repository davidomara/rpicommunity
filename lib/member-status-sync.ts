import { prisma } from "@/lib/db";
import { getCommunitySettings } from "@/lib/community-settings";
import { resolveMemberStatus } from "@/lib/member-status";
import { COMMUNITY_ROLES, STATUS_MODE } from "@/lib/domain-types";

const STATUS_SYNC_INTERVAL_MS = 60_000;

let lastStatusSyncAt = 0;
let inFlightStatusSync: Promise<Awaited<ReturnType<typeof getCommunitySettings>>> | null = null;

export async function syncAutoMemberStatuses() {
  const now = Date.now();
  if (lastStatusSyncAt && now - lastStatusSyncAt < STATUS_SYNC_INTERVAL_MS) {
    return getCommunitySettings();
  }

  if (inFlightStatusSync) {
    return inFlightStatusSync;
  }

  inFlightStatusSync = (async () => {
    const [settings, members, contributionTotals] = await Promise.all([
      getCommunitySettings(),
      prisma.user.findMany({
        where: {
          role: { in: COMMUNITY_ROLES },
          statusMode: STATUS_MODE.AUTO
        },
        select: {
          id: true,
          status: true
        }
      }),
      prisma.contribution.groupBy({
        by: ["memberId"],
        _sum: { amount: true }
      })
    ]);

    const contributionTotalByMemberId = new Map(
      contributionTotals.map((row) => [row.memberId, Number(row._sum.amount ?? 0)])
    );

    const updates = members.reduce<ReturnType<typeof prisma.user.update>[]>((acc, member) => {
      const totalContributions = contributionTotalByMemberId.get(member.id) ?? 0;
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

    lastStatusSyncAt = Date.now();
    return settings;
  })();

  try {
    return await inFlightStatusSync;
  } finally {
    inFlightStatusSync = null;
  }
}
