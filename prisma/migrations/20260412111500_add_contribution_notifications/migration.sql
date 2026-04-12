CREATE TYPE "ContributionApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "Contribution"
ADD COLUMN "approvalStatus" "ContributionApprovalStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN "approvedAt" TIMESTAMP(3),
ADD COLUMN "approvedById" TEXT,
ADD COLUMN "rejectedAt" TIMESTAMP(3),
ADD COLUMN "rejectedById" TEXT;

CREATE INDEX "Contribution_approvalStatus_contributionDate_idx" ON "Contribution"("approvalStatus", "contributionDate");
CREATE INDEX "Contribution_approvedById_idx" ON "Contribution"("approvedById");
CREATE INDEX "Contribution_rejectedById_idx" ON "Contribution"("rejectedById");

ALTER TABLE "Contribution"
ADD CONSTRAINT "Contribution_approvedById_fkey"
FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Contribution"
ADD CONSTRAINT "Contribution_rejectedById_fkey"
FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
