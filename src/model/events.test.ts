import { describe, expect, it, vi } from "vitest";
import prisma from "../__mocks__/prisma.ts";
import { findEventById } from "./events.ts";

vi.mock("../prisma.ts");

describe("find event by id", () => {
  const events = [
    {
      id: "plupp1",
      title: "apa1",
      location: "snor",
      dateTime: new Date(Date.now()),
    },
    {
      id: "plupp2",
      title: "apa2",
      location: "snor",
      dateTime: new Date(Date.now()),
    },
    {
      id: "plupp2",
      title: "apa2",
      location: "snor",
      dateTime: new Date(Date.now()),
    },
  ];

  it("throws error when there is more than one id", async () => {
    prisma.event.findUniqueOrThrow.mockResolvedValue(events[0]!);
    expect(async () => await findEventById(prisma, "plupp2")).toThrow();
  });
  it("throws error when there is no event with id", async () => {
    prisma.event.findUniqueOrThrow.mockResolvedValue(events[0]!);
    expect(async () => await findEventById(prisma, "plupp0")).toThrow();
  });
  it("returns the event with the given id", async () => {
    prisma.event.findUniqueOrThrow.mockResolvedValue(events[0]!);
    expect(await findEventById(prisma, "plupp1")).toBe(events[0]!);
  });
});
