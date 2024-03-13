import { describe, expect, it } from "vitest";
import { UUIDMock } from "graphql-scalars";
import {
  inFourWeeks,
  inOneDay,
  inOneWeek,
  now,
} from "../../../../src/common/dateTime";
import * as Events from "../../../../src/model/events";
import * as Registrations from "../../../../src/model/registrations";
import prisma from "../../../../src/prisma";
import { EventExtension } from "../../../../src/prisma/extensions/EventExtension";
import { RegistrationExtension } from "../../../../src/prisma/extensions/RegistrationExtension";

describe("Register to event", () => {
  const event = Events.EventSchemaWithConstraints.parse({
    title: "Apa",
    location: "Plupp Snor",
    dateTime: inFourWeeks(),
    isPublishedAt: now(),
    opensForRegistrationsAt: inOneDay(),
    closesForRegistrationsAt: inOneWeek(),
  });

  const contactInfoInput: Registrations.ContactInfoSchema = {
    email: "plupp@snor.com",
    firstName: "Plupp",
    lastName: "Snor",
    firstNickName: null,
    lastNickName: null,
  };

  it("should find the registration that was added on the event", async () => {
    const addedEvent = await prisma.event.create({ data: event });
    expect(addedEvent).toBeDefined();

    await prisma
      .$extends(EventExtension)
      .event.openRegistrations({ id: addedEvent.id });

    const addedRegistration = await prisma
      .$extends(RegistrationExtension)
      .emailRegistration.registerTo({
        email: contactInfoInput.email,
        event: addedEvent.id,
        contactInfo: contactInfoInput,
      });
    expect(addedRegistration).toBeDefined();

    const exists = await prisma
      .$extends(RegistrationExtension)
      .emailRegistration.exists({
        email_eventId: {
          email: contactInfoInput.email,
          eventId: addedEvent.id,
        },
      });
    expect(exists).toBe(true);

    const found = await prisma
      .$extends(RegistrationExtension)
      .emailRegistration.findUniqueOrThrow({
        where: {
          email_eventId: {
            email: contactInfoInput.email,
            eventId: addedEvent.id,
          },
        },
      });
    expect(found).toBeDefined();
    expect(found).toMatchObject(addedRegistration);
  });

  it("should not create registration if event with the id does not exist", async () => {
    const nonExistingEventId = UUIDMock();

    expect(
      prisma.$extends(RegistrationExtension).emailRegistration.create({
        data: {
          email: contactInfoInput.email,
          eventId: nonExistingEventId,
        },
      }),
    ).rejects.toThrowError();

    const exists = await prisma
      .$extends(RegistrationExtension)
      .emailRegistration.exists({
        email_eventId: {
          eventId: nonExistingEventId,
          email: contactInfoInput.email,
        },
      });

    expect(exists).toBe(false);
  });

  it("should not create registration if there already exists a registration with that email on the event", async () => {
    const addedEvent = await prisma
      .$extends(EventExtension)
      .event.create({ data: event });
    expect(addedEvent).toBeDefined();

    await prisma
      .$extends(EventExtension)
      .event.openRegistrations({ id: addedEvent.id });

    const addedRegistration = await prisma
      .$extends(RegistrationExtension)
      .emailRegistration.registerTo({
        email: contactInfoInput.email,
        event: addedEvent.id,
        contactInfo: contactInfoInput,
      });

    expect(addedRegistration).toBeDefined();

    expect(
      prisma.$extends(RegistrationExtension).emailRegistration.registerTo({
        event: addedEvent.id,
        email: contactInfoInput.email,
        contactInfo: contactInfoInput,
      }),
    ).rejects.toThrowError();

    const exists = await prisma
      .$extends(RegistrationExtension)
      .emailRegistration.exists({
        email_eventId: {
          eventId: addedEvent.id,
          email: contactInfoInput.email,
        },
      });

    expect(exists).toBe(true);

    const found = await prisma
      .$extends(RegistrationExtension)
      .emailRegistration.findMany({
        where: { eventId: addedEvent.id },
      });
    expect(found).toBeDefined();
    expect(found).toHaveLength(1);
  });

  it("should not create registration if the event is closed", async () => {
    const addedEvent = await prisma
      .$extends(EventExtension)
      .event.create({ data: event });
    expect(addedEvent).toBeDefined();

    await prisma
      .$extends(EventExtension)
      .event.closeRegistrations({ id: addedEvent.id });

    expect(
      prisma.$extends(RegistrationExtension).emailRegistration.registerTo({
        event: addedEvent.id,
        contactInfo: contactInfoInput,
        email: contactInfoInput.email,
      }),
    ).rejects.toThrowError();

    const exists = await prisma
      .$extends(RegistrationExtension)
      .emailRegistration.exists({
        email_eventId: {
          eventId: addedEvent.id,
          email: contactInfoInput.email,
        },
      });

    expect(exists).toBe(false);

    const found = await prisma
      .$extends(RegistrationExtension)
      .emailRegistration.findMany({
        where: { eventId: addedEvent.id },
      });
    expect(found).toBeDefined();
    expect(found).toHaveLength(0);
  });
});
