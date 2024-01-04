import { ContactInfo, PersonalInfo } from "@prisma/client";
import { PrismaDelegate } from "../../prisma";

export const ERROR_DUPLICATE_REGISTRATION = "DUPLICATE_REGISTRATION";

export class Registrations extends PrismaDelegate {
  /**
   *
   * @param prisma
   * @param eventId
   * @param email
   * @returns
   */
  async existsForIdAndEmail(eventId: string, email: string) {
    try {
      await this.prisma.emailRegistration.findUniqueOrThrow({
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
  findForEventById(eventId: string) {
    return this.prisma.emailRegistration.findMany({
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
  findByEmail(email: string) {
    return this.prisma.emailRegistration.findMany({
      where: {
        email,
      },
    });
  }

  findByEventIdAndEmail(eventId: string, email: string) {
    return this.prisma.emailRegistration.findUniqueOrThrow({
      where: {
        email_eventId: {
          email,
          eventId,
        },
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
  async createForEventById(
    eventId: string,
    contactInfo: Omit<ContactInfo, "id">,
    personalInfo?: Omit<PersonalInfo, "id">,
  ) {
    if (await this.existsForIdAndEmail(eventId, contactInfo.email)) {
      console.error(
        `Tried to create duplicate registration for ${eventId} with email ${contactInfo.email}.`,
      );
      throw new Error("Registration already exists for this email", {
        cause: ERROR_DUPLICATE_REGISTRATION,
      });
    }

    // Creates an email registration, contacts and personal info, and connects to an event by id
    return this.prisma.emailRegistration.create({
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
}
