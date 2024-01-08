import { expect } from "vitest";
import { describe, it } from "vitest";
import * as Events from "./events";
import {
  inOneDay,
  inOneWeek,
  now,
  oneDayAgo,
  oneWeekAgo,
} from "../common/dateTime";

describe("Parse event schema", () => {
  const valid = Events.EventSchemaWithConstraints.parse({
    title: "title",
    location: "location",
    dateTime: inOneWeek(),
  });
  const invalidDateTime: typeof valid = {
    ...valid,
    dateTime: oneWeekAgo(),
  };
  const missingSomeData: Partial<typeof valid> = {
    ...valid,
  };
  delete missingSomeData.opensForRegistrationsAt;

  it("should be valid", () => {
    expect(() => Events.assertEventIsValid(valid)).not.toThrowError();
  });

  it("should be invalid if missing some data", () => {
    expect(() => Events.assertEventIsValid(invalidDateTime)).toThrowError();
    expect(() =>
      Events.assertEventIsValid(missingSomeData as typeof valid),
    ).toThrowError();
  });
});

describe("Event date constraints", () => {
  const today = now();
  const yesterday = oneDayAgo(today);
  const tomorrow = inOneDay(today);

  it("Should be published before opening", () => {
    expect(
      Events.isEventPublishedBeforeOpening({
        isPublishedAt: yesterday,
        opensForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      Events.isEventPublishedBeforeOpening({
        isPublishedAt: tomorrow,
        opensForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      Events.isEventPublishedBeforeOpening({
        isPublishedAt: tomorrow,
        opensForRegistrationsAt: today,
      }),
    ).toBe(false);
  });

  it("Should be published before closing", () => {
    expect(
      Events.isEventPublishedBeforeClosing({
        isPublishedAt: yesterday,
        closesForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      Events.isEventPublishedBeforeClosing({
        isPublishedAt: tomorrow,
        closesForRegistrationsAt: tomorrow,
      }),
    ).toBe(false);
    expect(
      Events.isEventPublishedBeforeClosing({
        isPublishedAt: tomorrow,
        closesForRegistrationsAt: today,
      }),
    ).toBe(false);
  });

  it("Should be published before starting", () => {
    expect(
      Events.isEventPublishedBeforeStarting({
        isPublishedAt: yesterday,
        dateTime: tomorrow,
      }),
    ).toBe(true);
    expect(
      Events.isEventPublishedBeforeStarting({
        isPublishedAt: tomorrow,
        dateTime: tomorrow,
      }),
    ).toBe(true);
    expect(
      Events.isEventPublishedBeforeStarting({
        isPublishedAt: tomorrow,
        dateTime: today,
      }),
    ).toBe(false);
  });

  it("Should be opening before closing", () => {
    expect(
      Events.isEventOpeningBeforeClosing({
        opensForRegistrationsAt: yesterday,
        closesForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      Events.isEventOpeningBeforeClosing({
        opensForRegistrationsAt: tomorrow,
        closesForRegistrationsAt: tomorrow,
      }),
    ).toBe(false);
    expect(
      Events.isEventOpeningBeforeClosing({
        opensForRegistrationsAt: tomorrow,
        closesForRegistrationsAt: today,
      }),
    ).toBe(false);
  });

  it("Should be opening before starting", () => {
    expect(
      Events.isEventOpeningBeforeStarting({
        opensForRegistrationsAt: yesterday,
        dateTime: tomorrow,
      }),
    ).toBe(true);
    expect(
      Events.isEventOpeningBeforeStarting({
        opensForRegistrationsAt: tomorrow,
        dateTime: tomorrow,
      }),
    ).toBe(true);
    expect(
      Events.isEventOpeningBeforeStarting({
        opensForRegistrationsAt: tomorrow,
        dateTime: today,
      }),
    ).toBe(false);
  });

  it("Should be closing before starting", () => {
    expect(
      Events.isEventClosingBeforeStarting({
        closesForRegistrationsAt: yesterday,
        dateTime: tomorrow,
      }),
    ).toBe(true);
    expect(
      Events.isEventClosingBeforeStarting({
        closesForRegistrationsAt: tomorrow,
        dateTime: tomorrow,
      }),
    ).toBe(true);
    expect(
      Events.isEventClosingBeforeStarting({
        closesForRegistrationsAt: tomorrow,
        dateTime: today,
      }),
    ).toBe(false);
  });
});
