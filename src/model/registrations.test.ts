import { it } from "vitest";
import { describe, expect } from "vitest";
import { now, oneDayAgo, inOneDay } from "../common/dateTime";
import * as Registrations from "./registrations";

describe("Can register to event", () => {
  const today = now();
  const yesterday = oneDayAgo(today);
  const tomorrow = inOneDay(today);
  const dayAfterTomorrow = inOneDay(tomorrow);

  it("should be true if event is published, opened and not closed", () => {
    expect(
      Registrations.canRegisterToEvent(
        {
          isPublishedAt: yesterday,
          opensForRegistrationsAt: yesterday,
          closesForRegistrationsAt: tomorrow,
        },
        today,
      ),
    ).toBe(true);

    expect(
      Registrations.canRegisterToEvent(
        {
          isPublishedAt: today,
          opensForRegistrationsAt: today,
          closesForRegistrationsAt: tomorrow,
        },
        today,
      ),
    ).toBe(true);
  });

  it("should be false if event is not published", () => {
    expect(
      Registrations.canRegisterToEvent(
        {
          isPublishedAt: tomorrow,
          opensForRegistrationsAt: tomorrow,
          closesForRegistrationsAt: dayAfterTomorrow,
        },
        today,
      ),
    ).toBe(false);
  });

  it("should be false if event is not opened", () => {
    expect(
      Registrations.canRegisterToEvent(
        {
          isPublishedAt: yesterday,
          opensForRegistrationsAt: tomorrow,
          closesForRegistrationsAt: dayAfterTomorrow,
        },
        today,
      ),
    ).toBe(false);
  });
});
