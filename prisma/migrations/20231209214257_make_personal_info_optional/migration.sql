-- DropForeignKey
ALTER TABLE "EmailRegistration" DROP CONSTRAINT "EmailRegistration_personalInfoId_fkey";

-- AlterTable
ALTER TABLE "EmailRegistration" ALTER COLUMN "personalInfoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EmailRegistration" ADD CONSTRAINT "EmailRegistration_personalInfoId_fkey" FOREIGN KEY ("personalInfoId") REFERENCES "PersonalInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
