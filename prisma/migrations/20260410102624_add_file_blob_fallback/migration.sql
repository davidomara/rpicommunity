-- AlterTable
ALTER TABLE "BankStatement" ADD COLUMN     "data" BYTEA;

-- AlterTable
ALTER TABLE "GoverningDocument" ADD COLUMN     "sizeBytes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "GoverningDocument" ADD COLUMN     "data" BYTEA;
