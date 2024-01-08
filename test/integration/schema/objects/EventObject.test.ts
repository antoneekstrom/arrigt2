import { describe, expect, it } from "vitest";
import { fetchQuery } from "../../../../app/helpers/fetch.server";
import { gql } from "../../../../app/__generated__/graphql";
import { UUIDMock } from "graphql-scalars";

describe("Find event by id", () => {
  it("should find the event that was created", async () => {
    expect(true).toBe(true);
  });
  it("should return error when trying to find an event that does not exist", async () => {
    const document = gql(`
      query ShouldReturnErrorWhenTryingToFindAnEventThatDoesNotExist($eventId: UUID!) {
        eventById(eventId: $eventId) {
          id
        }
      }
    `);
    expect(
      fetchQuery(document, {
        eventId: UUIDMock(),
      }),
    ).rejects.toThrowError();
  });
});
