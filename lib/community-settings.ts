import { prisma } from "@/lib/db";
import { DEFAULT_MEMBER_STATUS_THRESHOLDS } from "@/lib/member-status";

const COMMUNITY_SETTINGS_ID = "community";

export async function getCommunitySettings() {
  return prisma.communitySettings.upsert({
    where: { id: COMMUNITY_SETTINGS_ID },
    update: {},
    create: {
      id: COMMUNITY_SETTINGS_ID,
      ...DEFAULT_MEMBER_STATUS_THRESHOLDS
    }
  });
}
