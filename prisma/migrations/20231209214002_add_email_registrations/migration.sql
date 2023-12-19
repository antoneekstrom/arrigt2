-- CreateTable
CREATE TABLE "EmailRegistration" (
    "eventId" TEXT NOT NULL,
    "personalInfoId" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "EmailRegistration_pkey" PRIMARY KEY ("email","eventId")
);

-- CreateTable
CREATE TABLE "ContactInfo" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstNickName" TEXT,
    "lastNickName" TEXT,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalInfo" (
    "id" TEXT NOT NULL,
    "allergies" TEXT[],
    "diet" TEXT NOT NULL,

    CONSTRAINT "PersonalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContactInfo_email_key" ON "ContactInfo"("email");

-- AddForeignKey
ALTER TABLE "EmailRegistration" ADD CONSTRAINT "EmailRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailRegistration" ADD CONSTRAINT "EmailRegistration_personalInfoId_fkey" FOREIGN KEY ("personalInfoId") REFERENCES "PersonalInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailRegistration" ADD CONSTRAINT "EmailRegistration_email_fkey" FOREIGN KEY ("email") REFERENCES "ContactInfo"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
