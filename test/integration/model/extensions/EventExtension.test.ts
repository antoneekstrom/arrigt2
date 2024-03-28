import { expect, describe, it } from "vitest";
import {
  inOneWeek,
  oneWeekAgo,
  inOneDay,
} from "../../../../src/common/dateTime";
import { EventExtension } from "../../../../src/prisma/extensions/EventExtension";
import * as Events from "../../../../src/model/events";
import prisma from "../../../../src/prisma";

describe("Create event", () => {
  const event = Events.EventSchemaWithConstraints.parse({
    title: "Apa",
    location: "Plupp Snor",
    dateTime: new Date(),
  });

  it("should find the event that was created", async () => {
    const added = await prisma
      .$extends(EventExtension)
      .event.create({ data: event });
    expect(added).toBeDefined();

    const found = await prisma
      .$extends(EventExtension)
      .event.findUniqueOrThrow({
        where: { id: added.id },
      });
    expect(found).toBeDefined();

    expect(found).toMatchObject(added);
    expect(found).toMatchObject(event);
  });

  it("should change the event that was created", async () => {
    const added = await prisma
      .$extends(EventExtension)
      .event.create({ data: event });
    expect(added).toBeDefined();

    const found = await prisma
      .$extends(EventExtension)
      .event.findUniqueOrThrow({
        where: { id: added.id },
      });
    expect(found).toBeDefined();

    const updateData = {
      title: "Bepa",
      location: "Snor Plupp",
    };
    const edited = await prisma
      .$extends(EventExtension)
      .event.edit({ id: found.id }, updateData);

    expect(edited).toBeDefined();
    expect(edited).not.toMatchObject(found);
    expect(edited.title).toBe(updateData.title);
  });
});

describe("Edit event", () => {
  it("should return new data when editing an event", async () => {
    const event = await prisma.$extends(EventExtension).event.create({
      data: {
        title: "title",
        location: "location",
        dateTime: inOneWeek(),
      },
    });

    const updatedEvent = await prisma.$extends(EventExtension).event.edit(
      {
        id: event.id,
      },
      {
        title: "new title",
      },
    );

    expect(updatedEvent.title).toBe("new title");
  });

  it("should throw error when trying to edit an event with invalid data", async () => {
    const event = await prisma.$extends(EventExtension).event.create({
      data: {
        title: "title",
        location: "location",
        dateTime: inOneWeek(),
        opensForRegistrationsAt: inOneDay(),
      },
    });

    await expect(
      prisma.$extends(EventExtension).event.edit(
        {
          id: event.id,
        },
        {
          closesForRegistrationsAt: oneWeekAgo(),
        },
      ),
    ).rejects.toThrowError();
  });
});
