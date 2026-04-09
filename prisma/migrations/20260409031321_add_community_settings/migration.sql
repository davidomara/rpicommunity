/*
  Warnings:

  - You are about to drop the column `decidedById` on the `EmergencyRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EmergencyRequest" DROP CONSTRAINT "EmergencyRequest_decidedById_fkey";

-- AlterTable
ALTER TABLE "EmergencyRequest" DROP COLUMN "decidedById";
