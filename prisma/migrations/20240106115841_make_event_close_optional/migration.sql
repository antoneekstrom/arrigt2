-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "closesForRegistrationsAt" DROP NOT NULL,
ALTER COLUMN "closesForRegistrationsAt" DROP DEFAULT;
