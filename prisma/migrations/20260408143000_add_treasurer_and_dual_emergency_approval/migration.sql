ALTER TYPE "Role" ADD VALUE 'TREASURER';

ALTER TABLE "EmergencyRequest"
ADD COLUMN "approvedAmount" DECIMAL(12, 2),
ADD COLUMN "adminApprovedAt" TIMESTAMP(3),
ADD COLUMN "adminApprovedById" TEXT,
ADD COLUMN "treasurerApprovedAt" TIMESTAMP(3),
ADD COLUMN "treasurerApprovedById" TEXT,
ADD COLUMN "rejectedById" TEXT,
ADD COLUMN "disbursedAt" TIMESTAMP(3),
ADD COLUMN "disbursedById" TEXT;

ALTER TABLE "EmergencyRequest"
ADD CONSTRAINT "EmergencyRequest_adminApprovedById_fkey"
FOREIGN KEY ("adminApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmergencyRequest"
ADD CONSTRAINT "EmergencyRequest_treasurerApprovedById_fkey"
FOREIGN KEY ("treasurerApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmergencyRequest"
ADD CONSTRAINT "EmergencyRequest_rejectedById_fkey"
FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmergencyRequest"
ADD CONSTRAINT "EmergencyRequest_disbursedById_fkey"
FOREIGN KEY ("disbursedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "EmergencyRequest_adminApprovedById_idx" ON "EmergencyRequest"("adminApprovedById");
CREATE INDEX "EmergencyRequest_treasurerApprovedById_idx" ON "EmergencyRequest"("treasurerApprovedById");
CREATE INDEX "EmergencyRequest_rejectedById_idx" ON "EmergencyRequest"("rejectedById");
CREATE INDEX "EmergencyRequest_disbursedById_idx" ON "EmergencyRequest"("disbursedById");
