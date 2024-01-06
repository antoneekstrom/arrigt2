import { describe, expect, it } from "vitest";
import { Events } from "../../../../src/model/db/Events";
import { defaultEventData } from "../../../../src/model/events";
import prisma from "../../../../src/prisma";
import { Registrations } from "../../../../src/model/db/Registrations";
import { z } from "zod";
import { UUIDMock } from "graphql-scalars";
import { contactInfoInputSchema } from "../../../../src/schema/validation";
import {
  inFourWeeks,
  inOneDay,
  inOneWeek,
  now,
} from "../../../../src/common/dateTime";

describe("EmailRegistrations", () => {
  const events = new Events(prisma);
  const registrations = new Registrations(prisma);

  const event = defaultEventData({
    title: "Apa",
    location: "Plupp Snor",
    dateTime: inFourWeeks(),
    isPublishedAt: now(),
    opensForRegistrationsAt: inOneDay(),
    closesForRegistrationsAt: inOneWeek(),
  });

  const contactInfoInput: z.infer<typeof contactInfoInputSchema> = {
    email: "plupp@snor.com",
    firstName: "Plupp",
    lastName: "Snor",
    firstNickName: null,
    lastNickName: null,
  };

  it("should find the registration that was added on the event", async () => {
    const addedEvent = await events.create(event);
    expect(addedEvent).toBeDefined();

    await events.openById(addedEvent.id);

    const addedRegistration = await registrations.createForEventById(
      addedEvent.id,
      contactInfoInput,
    );
    expect(addedRegistration).toBeDefined();

    const exists = await registrations.existsForIdAndEmail(
      addedEvent.id,
      contactInfoInput.email,
    );
    expect(exists).toBe(true);

    const found = await registrations.findForEventById(addedEvent.id);
    expect(found).toBeDefined();
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject(addedRegistration);
  });

  it("should not create registration if event with the id does not exist", async () => {
    const nonExistingEventId = UUIDMock();

    expect(
      registrations.createForEventById(nonExistingEventId, contactInfoInput),
    ).rejects.toThrowError();

    const exists = await registrations.existsForIdAndEmail(
      nonExistingEventId,
      contactInfoInput.email,
    );

    expect(exists).toBe(false);
  });

  it("should not create registration if there already exists a registration with that email on the event", async () => {
    const addedEvent = await events.create(event);
    expect(addedEvent).toBeDefined();

    await events.openById(addedEvent.id);

    const addedRegistration = await registrations.createForEventById(
      addedEvent.id,
      contactInfoInput,
    );

    expect(addedRegistration).toBeDefined();

    expect(
      registrations.createForEventById(addedEvent.id, contactInfoInput),
    ).rejects.toThrowError();

    const exists = await registrations.existsForIdAndEmail(
      addedEvent.id,
      contactInfoInput.email,
    );

    expect(exists).toBe(true);

    const found = await registrations.findForEventById(addedEvent.id);
    expect(found).toBeDefined();
    expect(found).toHaveLength(1);
  });

  it("should not create registration if the event is closed", async () => {
    const addedEvent = await events.create(event);
    expect(addedEvent).toBeDefined();

    await events.closeById(addedEvent.id);

    expect(
      registrations.createForEventById(addedEvent.id, contactInfoInput),
    ).rejects.toThrowError();

    const exists = await registrations.existsForIdAndEmail(
      addedEvent.id,
      contactInfoInput.email,
    );

    expect(exists).toBe(false);

    const found = await registrations.findForEventById(addedEvent.id);
    expect(found).toBeDefined();
    expect(found).toHaveLength(0);
  });
});
