/*
  Warnings:

  - You are about to drop the column `preferenceId` on the `Registration` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_preferenceId_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "author" DROP NOT NULL,
ALTER COLUMN "organizer" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Registration" DROP COLUMN "preferenceId",
ADD COLUMN     "preferencesId" TEXT;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_preferencesId_fkey" FOREIGN KEY ("preferencesId") REFERENCES "Preferences"("id") ON DELETE SET NULL ON UPDATE CASCADE;
