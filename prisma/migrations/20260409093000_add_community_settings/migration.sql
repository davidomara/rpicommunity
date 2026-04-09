CREATE TABLE "CommunitySettings" (
  "id" TEXT NOT NULL DEFAULT 'community',
  "warningAfterMonths" INTEGER NOT NULL DEFAULT 3,
  "closeAfterMonths" INTEGER NOT NULL DEFAULT 6,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CommunitySettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "CommunitySettings" ("id", "warningAfterMonths", "closeAfterMonths", "updatedAt")
VALUES ('community', 3, 6, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
