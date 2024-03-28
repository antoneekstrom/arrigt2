/*
  Warnings:

  - You are about to drop the column `closesForRegistrationsAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `isPublishedAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `opensForRegistrationsAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `ContactInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailRegistration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PersonalInfo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `author` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataAgreementId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizer` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EmailRegistration" DROP CONSTRAINT "EmailRegistration_email_fkey";

-- DropForeignKey
ALTER TABLE "EmailRegistration" DROP CONSTRAINT "EmailRegistration_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EmailRegistration" DROP CONSTRAINT "EmailRegistration_personalInfoId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "closesForRegistrationsAt",
DROP COLUMN "isPublishedAt",
DROP COLUMN "opensForRegistrationsAt",
ADD COLUMN     "author" TEXT NOT NULL,
ADD COLUMN     "dataAgreementId" TEXT NOT NULL,
ADD COLUMN     "organizer" TEXT NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "ContactInfo";

-- DropTable
DROP TABLE "EmailRegistration";

-- DropTable
DROP TABLE "PersonalInfo";

-- CreateTable
CREATE TABLE "DataAgreement" (
    "id" TEXT NOT NULL,
    "deleteAt" TIMESTAMP(3) NOT NULL,
    "dataStored" TEXT[],
    "parties" TEXT[],
    "contactEmail" TEXT NOT NULL,

    CONSTRAINT "DataAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "eventId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "preferenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("email","eventId")
);

-- CreateTable
CREATE TABLE "Attendee" (
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstNickName" TEXT,
    "lastNickName" TEXT,

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "Preferences" (
    "id" TEXT NOT NULL,
    "diet" TEXT NOT NULL,
    "allergies" TEXT[],
    "extra" TEXT NOT NULL,

    CONSTRAINT "Preferences_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_dataAgreementId_fkey" FOREIGN KEY ("dataAgreementId") REFERENCES "DataAgreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_email_fkey" FOREIGN KEY ("email") REFERENCES "Attendee"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "Preferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
