import { describe, expect, it } from "vitest";
import {
  inFourWeeks,
  inOneDay,
  inOneWeek,
  oneDayAgo,
} from "../common/dateTime";
import {
  eventSchema,
  createEventData,
  eventIsPublishedBeforeOpening,
  eventOpensBeforeClosing,
  eventStartsAfterClosing,
  isEventOpenForRegistering,
} from "./events";
import { expectValid } from "../../test/helpers";

describe("default event", () => {
  const now = new Date(Date.now());
  it("should be valid", () => {
    expectValid(
      eventSchema,
      createEventData("title", "location", oneDayAgo(now)),
    );
    expectValid(eventSchema, createEventData("title", "location", now));
    expectValid(
      eventSchema,
      createEventData("title", "location", inFourWeeks(now)),
    );
  });
});

describe("isEventPublishedValid", () => {
  const now = new Date(Date.now());

  it("returns true when published and opening at the same time", () => {
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: now,
        opensForRegistrationsAt: now,
        closesForRegistrationsAt: inOneWeek(now),
      }),
    ).toBe(true);
  });

  it("returns true when published before closing for registration", () => {
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: now,
        opensForRegistrationsAt: now,
        closesForRegistrationsAt: inOneWeek(now),
      }),
    ).toBe(true);
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: now,
        opensForRegistrationsAt: now,
        closesForRegistrationsAt: oneDayAgo(now),
      }),
    ).toBe(false);
  });

  it("returns true when published before opening for registration", () => {
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: now,
        opensForRegistrationsAt: inOneDay(now),
        closesForRegistrationsAt: inFourWeeks(now),
      }),
    ).toBe(true);
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: now,
        opensForRegistrationsAt: oneDayAgo(now),
        closesForRegistrationsAt: inFourWeeks(now),
      }),
    ).toBe(false);
  });
});

describe("isEventclosesForRegistrationsValid", () => {
  const now = new Date(Date.now());

  it("returns true when closing for registration after opening for registration", () => {
    expect(
      eventOpensBeforeClosing({
        opensForRegistrationsAt: now,
        closesForRegistrationsAt: inOneWeek(now),
      }),
    ).toBe(true);
    expect(
      eventOpensBeforeClosing({
        opensForRegistrationsAt: now,
        closesForRegistrationsAt: oneDayAgo(now),
      }),
    ).toBe(false);
  });
});

describe("isEventDateTimeValid", () => {
  const now = new Date(Date.now());

  it("returns true when event starts after publishing, opening, and closing for registration", () => {
    expect(
      eventStartsAfterClosing({
        dateTime: inOneWeek(now),
        isPublishedAt: now,
        opensForRegistrationsAt: now,
        closesForRegistrationsAt: inFourWeeks(now),
      }),
    ).toBe(true);
    expect(
      eventStartsAfterClosing({
        dateTime: inFourWeeks(now),
        isPublishedAt: now,
        opensForRegistrationsAt: now,
        closesForRegistrationsAt: inOneWeek(now),
      }),
    ).toBe(false);
  });
});

describe("isEventOpenForRegistration", () => {
  const now = new Date(Date.now());

  it("returns true when now is before closing", () => {
    expect(
      isEventOpenForRegistering(
        {
          isPublishedAt: now,
          opensForRegistrationsAt: now,
          closesForRegistrationsAt: inFourWeeks(now),
        },
        now,
      ),
    ).toBe(true);
    expect(
      isEventOpenForRegistering(
        {
          isPublishedAt: now,
          opensForRegistrationsAt: now,
          closesForRegistrationsAt: inFourWeeks(now),
        },
        inFourWeeks(now),
      ),
    ).toBe(false);
  });

  it("returns false when now is before opening", () => {
    expect(
      isEventOpenForRegistering(
        {
          isPublishedAt: now,
          opensForRegistrationsAt: inOneDay(now),
          closesForRegistrationsAt: inFourWeeks(now),
        },
        now,
      ),
    ).toBe(false);
  });
});
