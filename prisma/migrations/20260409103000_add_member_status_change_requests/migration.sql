CREATE TYPE "StatusMode" AS ENUM ('AUTO', 'MANUAL');
CREATE TYPE "ChangeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "User"
ADD COLUMN "statusMode" "StatusMode" NOT NULL DEFAULT 'AUTO';

CREATE TABLE "MemberStatusChangeRequest" (
  "id" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "currentStatus" "MemberStatus" NOT NULL,
  "requestedStatus" "MemberStatus" NOT NULL,
  "status" "ChangeRequestStatus" NOT NULL DEFAULT 'PENDING',
  "requestedById" TEXT NOT NULL,
  "adminApprovedAt" TIMESTAMP(3),
  "adminApprovedById" TEXT,
  "treasurerApprovedAt" TIMESTAMP(3),
  "treasurerApprovedById" TEXT,
  "rejectedAt" TIMESTAMP(3),
  "rejectedById" TEXT,
  "appliedAt" TIMESTAMP(3),
  "appliedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MemberStatusChangeRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MemberStatusChangeRequest_memberId_status_createdAt_idx" ON "MemberStatusChangeRequest"("memberId", "status", "createdAt");
CREATE INDEX "MemberStatusChangeRequest_requestedById_idx" ON "MemberStatusChangeRequest"("requestedById");
CREATE INDEX "MemberStatusChangeRequest_adminApprovedById_idx" ON "MemberStatusChangeRequest"("adminApprovedById");
CREATE INDEX "MemberStatusChangeRequest_treasurerApprovedById_idx" ON "MemberStatusChangeRequest"("treasurerApprovedById");

ALTER TABLE "MemberStatusChangeRequest"
ADD CONSTRAINT "MemberStatusChangeRequest_memberId_fkey"
FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MemberStatusChangeRequest"
ADD CONSTRAINT "MemberStatusChangeRequest_requestedById_fkey"
FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MemberStatusChangeRequest"
ADD CONSTRAINT "MemberStatusChangeRequest_adminApprovedById_fkey"
FOREIGN KEY ("adminApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MemberStatusChangeRequest"
ADD CONSTRAINT "MemberStatusChangeRequest_treasurerApprovedById_fkey"
FOREIGN KEY ("treasurerApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MemberStatusChangeRequest"
ADD CONSTRAINT "MemberStatusChangeRequest_rejectedById_fkey"
FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MemberStatusChangeRequest"
ADD CONSTRAINT "MemberStatusChangeRequest_appliedById_fkey"
FOREIGN KEY ("appliedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
