import { prisma } from "@/lib/db";
import { DEFAULT_MEMBER_STATUS_THRESHOLDS } from "@/lib/member-status";

const COMMUNITY_SETTINGS_ID = "community";

export async function getCommunitySettings() {
  try {
    const settings = await prisma.communitySettings.findUnique({
      where: { id: COMMUNITY_SETTINGS_ID }
    });

    if (settings) return settings;
  } catch (error) {
    console.error("Failed to read community settings", error);
  }

  return {
    id: COMMUNITY_SETTINGS_ID,
    ...DEFAULT_MEMBER_STATUS_THRESHOLDS,
    createdAt: new Date(0),
    updatedAt: new Date(0)
  };
}
