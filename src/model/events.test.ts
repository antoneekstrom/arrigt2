import { expect } from "vitest";
import { describe, it } from "vitest";
import {
  assertEventIsValid,
  defaultEventData,
  eventIsPublishedBeforeOpening,
} from "./events";
import { inOneDay, inOneWeek, oneDayAgo, oneWeekAgo } from "../common/dateTime";

describe("Default event data", () => {
  it("should be valid", () => {
    const valid = defaultEventData({
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

    expect(() => assertEventIsValid(valid)).not.toThrowError();
    expect(() => assertEventIsValid(invalidDateTime)).toThrowError();
    expect(() =>
      assertEventIsValid(missingSomeData as typeof valid),
    ).toThrowError();
  });
});

describe("Event date constraints", () => {
  const today = new Date(Date.now());
  const yesterday = oneDayAgo(today);
  const tomorrow = inOneDay(today);

  it("Should be published before opening.", () => {
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: yesterday,
        opensForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: tomorrow,
        opensForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: tomorrow,
        opensForRegistrationsAt: today,
      }),
    ).toBe(false);
  });

  it("Should be published before closing.", () => {
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: yesterday,
        opensForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: tomorrow,
        opensForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: tomorrow,
        opensForRegistrationsAt: today,
      }),
    ).toBe(false);
  });

  it("Should be published before starting.", () => {
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: yesterday,
        opensForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: tomorrow,
        opensForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: tomorrow,
        opensForRegistrationsAt: today,
      }),
    ).toBe(false);
  });

  it("Should be opening before closing.", () => {
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: yesterday,
        opensForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: tomorrow,
        opensForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: tomorrow,
        opensForRegistrationsAt: today,
      }),
    ).toBe(false);
  });

  it("Should be opening before starting.", () => {
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: yesterday,
        opensForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: tomorrow,
        opensForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: tomorrow,
        opensForRegistrationsAt: today,
      }),
    ).toBe(false);
  });

  it("Should be starting before closing.", () => {
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: yesterday,
        opensForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: tomorrow,
        opensForRegistrationsAt: tomorrow,
      }),
    ).toBe(true);
    expect(
      eventIsPublishedBeforeOpening({
        isPublishedAt: tomorrow,
        opensForRegistrationsAt: today,
      }),
    ).toBe(false);
  });
});
