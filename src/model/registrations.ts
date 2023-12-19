import { AnyPrismaClient } from "../prisma";
import { ContactInfo, PersonalInfo } from "@prisma/client";
import { z } from "zod";
import { now } from "../common/dateTime";

export const contactInfoSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  firstNickname: z.string().optional(),
  lastNickname: z.string().optional(),
});

export const PersonalInfoSchema = z.object({
  id: z.string().uuid(),
  allergies: z.string().array(),
  diet: z.string(),
});

export const emailRegistrationSchema = z.object({
  createdAt: z.date(),
  email: z.string().email(),
  eventId: z.string().uuid(),
  personalInfoId: z.string().uuid().optional(),
});

export function createEmailRegistrationData(
  eventId: string,
  email: string,
): z.infer<typeof emailRegistrationSchema> {
  return {
    eventId,
    email,
    createdAt: now(),
  };
}

/**
 *
 * @param prisma
 * @param eventId
 * @param email
 * @returns
 */
export async function existsRegistrationForEventWithEmail(
  prisma: AnyPrismaClient,
  eventId: string,
  email: string,
) {
  try {
    await prisma.emailRegistration.findUnique({
      where: {
        email_eventId: {
          email,
          eventId,
        },
      },
    });
  } catch (err) {
    return false;
  }
  return true;
}

/**
 *
 * @param prisma
 * @param eventId
 * @returns
 */
export function findEmailRegistrationsByEvent(
  prisma: AnyPrismaClient,
  eventId: string,
) {
  return prisma.emailRegistration.findMany({
    where: {
      eventId,
    },
  });
}

/**
 *
 * @param prisma
 * @param email
 * @returns
 */
export function findEmailRegistrationsByEmail(
  prisma: AnyPrismaClient,
  email: string,
) {
  return prisma.emailRegistration.findMany({
    where: {
      email,
    },
  });
}

/**
 *
 * @param prisma
 * @param eventId
 * @param contactInfo
 * @param personalInfo
 * @returns
 */
export function addEmailRegistrationForEvent(
  prisma: AnyPrismaClient,
  eventId: string,
  contactInfo: Omit<ContactInfo, "id">,
  personalInfo?: Omit<PersonalInfo, "id">,
) {
  // Creates an email registration, contacts and personal info, and connects to an event by id
  return prisma.emailRegistration.create({
    data: {
      personalInfo: {
        create: personalInfo,
      },
      contactInfo: {
        // Reuse the same contact info if the email already exists
        connectOrCreate: {
          create: contactInfo,
          where: {
            email: contactInfo.email,
          },
        },
      },
      event: {
        connect: {
          id: eventId,
        },
      },
    },
  });
}
