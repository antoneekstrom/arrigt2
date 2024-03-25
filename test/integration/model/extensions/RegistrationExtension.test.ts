import { describe, expect, it } from "vitest";
import * as Events from "../../../../src/model/events";
import * as Registrations from "../../../../src/model/registrations";
import prisma from "../../../../src/prisma";
import { DataAgreement } from "@prisma/client";

const today = new Date("2001-06-01");
const tomorrow = new Date("2001-06-02");
const nextWeek = new Date("2001-06-08");
const nextMonth = new Date("2001-07-01");

const agreement: DataAgreement = {
  id: crypto.randomUUID(),
  contactEmail: "plupp@email.com",
  dataStored: [],
  parties: [],
  deleteAt: nextMonth,
};

describe("Register to event", () => {
  const event = Events.EventInputSchema.parse({
    title: "Apa",
    location: "Plupp Snor",
    dateTime: nextMonth,
    isPublishedAt: today,
    opensForRegistrationsAt: tomorrow,
    closesForRegistrationsAt: nextWeek,
  });

  const contactInfoInput = {
    email: "plupp@snor.com",
    firstName: "Plupp",
    lastName: "Snor",
    firstNickName: null,
    lastNickName: null,
  };

  it("should find the registration that was added on the event", async () => {
    const addedEvent = await prisma.event.createWithAgreement(event, agreement);
    expect(addedEvent).toBeDefined();

    await prisma
      .$extends(Events.EventsModel)
      .event.openRegistrations({ id: addedEvent.id });

    const addedRegistration = await prisma
      .$extends(Registrations.RegistrationsModel)
      .registration.createWithEmail(addedEvent.id, contactInfoInput);
    expect(addedRegistration).toBeDefined();

    const exists = await prisma
      .$extends(Registrations.RegistrationsModel)
      .registration.exists({
        email_eventId: {
          email: contactInfoInput.email,
          eventId: addedEvent.id,
        },
      });
    expect(exists).toBe(true);

    const found = await prisma
      .$extends(Registrations.RegistrationsModel)
      .registration.findUniqueOrThrow({
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
    const nonExistingEventId = crypto.randomUUID();

    expect(
      prisma
        .$extends(Registrations.RegistrationsModel)
        .registration.createWithEmail(nonExistingEventId, {
          email: contactInfoInput.email,
          firstName: "apa",
          lastName: "snor",
        }),
    ).rejects.toThrowError();

    const exists = await prisma
      .$extends(Registrations.RegistrationsModel)
      .registration.exists({
        email_eventId: {
          eventId: nonExistingEventId,
          email: contactInfoInput.email,
        },
      });

    expect(exists).toBe(false);
  });

  it("should not create registration if there already exists a registration with that email on the event", async () => {
    const addedEvent = await prisma
      .$extends(Events.EventsModel)
      .event.createWithAgreement(event, agreement);
    expect(addedEvent).toBeDefined();

    await prisma
      .$extends(Events.EventsModel)
      .event.openRegistrations({ id: addedEvent.id });

    const addedRegistration = await prisma
      .$extends(Registrations.RegistrationsModel)
      .registration.createWithEmail(addedEvent.id, contactInfoInput);

    expect(addedRegistration).toBeDefined();

    expect(
      prisma
        .$extends(Registrations.RegistrationsModel)
        .registration.createWithEmail(addedEvent.id, contactInfoInput),
    ).rejects.toThrowError();

    const exists = await prisma
      .$extends(Registrations.RegistrationsModel)
      .registration.exists({
        email_eventId: {
          eventId: addedEvent.id,
          email: contactInfoInput.email,
        },
      });

    expect(exists).toBe(true);

    const found = await prisma
      .$extends(Registrations.RegistrationsModel)
      .registration.findMany({
        where: { eventId: addedEvent.id },
      });
    expect(found).toBeDefined();
    expect(found).toHaveLength(1);
  });

  it("should not create registration if the event is closed", async () => {
    const addedEvent = await prisma
      .$extends(Events.EventsModel)
      .event.createWithAgreement(event, agreement);
    expect(addedEvent).toBeDefined();

    await prisma
      .$extends(Events.EventsModel)
      .event.closeRegistrations({ id: addedEvent.id });

    expect(
      prisma
        .$extends(Registrations.RegistrationsModel)
        .registration.createWithEmail(addedEvent.id, contactInfoInput),
    ).rejects.toThrowError();

    const exists = await prisma
      .$extends(Registrations.RegistrationsModel)
      .registration.exists({
        email_eventId: {
          eventId: addedEvent.id,
          email: contactInfoInput.email,
        },
      });

    expect(exists).toBe(false);

    const found = await prisma
      .$extends(Registrations.RegistrationsModel)
      .registration.findMany({
        where: { eventId: addedEvent.id },
      });
    expect(found).toBeDefined();
    expect(found).toHaveLength(0);
  });
});
