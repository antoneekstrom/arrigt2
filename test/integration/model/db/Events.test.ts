import { describe, expect, it } from "vitest";
import { Events } from "../../../../src/model/db/Events";
import { defaultEventData } from "../../../../src/model/events";
import prisma from "../../../../src/prisma";

describe("Events", () => {
  const events = new Events(prisma);

  const event = defaultEventData({
    title: "Apa",
    location: "Plupp Snor",
    dateTime: new Date(),
  });

  it("should find the event that was added to the database", async () => {
    const added = await events.create(event);
    expect(added).toBeDefined();

    const found = await events.findById(added.id);
    expect(found).toBeDefined();

    expect(found).toMatchObject(added);
    expect(found).toMatchObject(event);
  });

  it("should change the event that was added to the database", async () => {
    const added = await events.create(event);
    expect(added).toBeDefined();

    const found = await events.findById(added.id);
    expect(found).toBeDefined();

    const updateData = {
      title: "Bepa",
      location: "Snor Plupp",
    };
    const edited = await events.updateById(found.id, updateData);

    expect(edited).toBeDefined();
    expect(edited).not.toMatchObject(found);
    expect(edited.title).toBe(updateData.title);
  });
});
