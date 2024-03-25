import { expect, describe, it } from "vitest";
import * as Events from "./events";

const yesterday = new Date("2001-05-30");
const today = new Date("2001-06-01");
const tomorrow = new Date("2001-06-02");
const nextWeek = new Date("2001-06-08");

describe("Parse event schema", () => {
  const valid = Events.EventInputSchema.parse({
    title: "title",
    location: "location",
    dateTime: nextWeek,
  });
  const invalidDateTime: typeof valid = {
    ...valid,
    dateTime: yesterday,
  };
  const missingSomeData: Partial<typeof valid> = {
    ...valid,
    dateTime: undefined,
  };

  it("should be valid", () => {
    expect(() => Events.EventInputSchema.parse(valid)).not.toThrowError();
  });

  it("should be invalid if missing some data", () => {
    expect(() => Events.EventInputSchema.parse(invalidDateTime)).toThrowError();
    expect(() =>
      Events.EventInputSchema.parse(missingSomeData as typeof valid),
    ).toThrowError();
  });
});

describe("Event date constraints", () => {
  // it("Should be published before opening", () => {
  //   expect(
  //     Events.isEventPublishedBeforeOpening({
  //       publishedAt: yesterday,
  //       opensForRegistrationsAt: tomorrow,
  //     }),
  //   ).toBe(true);
  //   expect(
  //     Events.isEventPublishedBeforeOpening({
  //       publishedAt: tomorrow,
  //       opensForRegistrationsAt: tomorrow,
  //     }),
  //   ).toBe(true);
  //   expect(
  //     Events.isEventPublishedBeforeOpening({
  //       publishedAt: tomorrow,
  //       opensForRegistrationsAt: today,
  //     }),
  //   ).toBe(false);
  // });

  // it("Should be published before closing", () => {
  //   expect(
  //     Events.isEventPublishedBeforeClosing({
  //       publishedAt: yesterday,
  //       closesForRegistrationsAt: tomorrow,
  //     }),
  //   ).toBe(true);
  //   expect(
  //     Events.isEventPublishedBeforeClosing({
  //       publishedAt: tomorrow,
  //       closesForRegistrationsAt: tomorrow,
  //     }),
  //   ).toBe(false);
  //   expect(
  //     Events.isEventPublishedBeforeClosing({
  //       publishedAt: tomorrow,
  //       closesForRegistrationsAt: today,
  //     }),
  //   ).toBe(false);
  // });

  it("Should be published before starting", () => {
    expect(
      Events.isPublishedBeforeStarting({
        publishedAt: yesterday,
        dateTime: tomorrow,
      }),
    ).toBe(true);
    expect(
      Events.isPublishedBeforeStarting({
        publishedAt: tomorrow,
        dateTime: tomorrow,
      }),
    ).toBe(true);
    expect(
      Events.isPublishedBeforeStarting({
        publishedAt: tomorrow,
        dateTime: today,
      }),
    ).toBe(false);
  });

  //   it("Should be opening before closing", () => {
  //     expect(
  //       Events.isEventOpeningBeforeClosing({
  //         opensForRegistrationsAt: yesterday,
  //         closesForRegistrationsAt: tomorrow,
  //       }),
  //     ).toBe(true);
  //     expect(
  //       Events.isEventOpeningBeforeClosing({
  //         opensForRegistrationsAt: tomorrow,
  //         closesForRegistrationsAt: tomorrow,
  //       }),
  //     ).toBe(false);
  //     expect(
  //       Events.isEventOpeningBeforeClosing({
  //         opensForRegistrationsAt: tomorrow,
  //         closesForRegistrationsAt: today,
  //       }),
  //     ).toBe(false);
  //   });

  //   it("Should be opening before starting", () => {
  //     expect(
  //       Events.isEventOpeningBeforeStarting({
  //         opensForRegistrationsAt: yesterday,
  //         dateTime: tomorrow,
  //       }),
  //     ).toBe(true);
  //     expect(
  //       Events.isEventOpeningBeforeStarting({
  //         opensForRegistrationsAt: tomorrow,
  //         dateTime: tomorrow,
  //       }),
  //     ).toBe(true);
  //     expect(
  //       Events.isEventOpeningBeforeStarting({
  //         opensForRegistrationsAt: tomorrow,
  //         dateTime: today,
  //       }),
  //     ).toBe(false);
  //   });

  //   it("Should be closing before starting", () => {
  //     expect(
  //       Events.isEventClosingBeforeStarting({
  //         closesForRegistrationsAt: yesterday,
  //         dateTime: tomorrow,
  //       }),
  //     ).toBe(true);
  //     expect(
  //       Events.isEventClosingBeforeStarting({
  //         closesForRegistrationsAt: tomorrow,
  //         dateTime: tomorrow,
  //       }),
  //     ).toBe(true);
  //     expect(
  //       Events.isEventClosingBeforeStarting({
  //         closesForRegistrationsAt: tomorrow,
  //         dateTime: today,
  //       }),
  //     ).toBe(false);
  //   });
});
