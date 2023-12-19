import { describe, expect, it } from "vitest";
import { yogaRequestHandler } from "../../src/yoga";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { gql } from "../../app/__generated__/graphql";
import { inFourWeeks } from "../../src/common/dateTime";
import { createEventData } from "../../src/model/events";

function assertSingleValue<TValue extends object>(
  value: TValue | AsyncIterable<TValue>,
): asserts value is TValue {
  if (Symbol.asyncIterator in value) {
    throw new Error("Expected single value");
  }
}

const executor = buildHTTPExecutor({
  fetch: yogaRequestHandler.fetch,
});

describe("get registrations for email", () => {
  it("returns empty array when the email does not exist in the database", async () => {
    const result = await executor({
      document: gql(/* GraphQL */ `
        query Test1 {
          registrationsByEmail(input: { email: "plupp@apasnor.com" }) {
            email
          }
        }
      `),
    });

    assertSingleValue(result);
    expect(result.errors).toBeUndefined();
    expect(result.data?.registrationsByEmail).toHaveLength(0);
  });
});

describe("get registrations for event", () => {
  it("returns empty array when there are no registrations for the event", async () => {
    const { title, dateTime, location } = createEventData(
      "title",
      "location",
      inFourWeeks(),
    );
    // create event
    const createdEvent = await executor({
      document: gql(/* GraphQL */ `
        mutation Test2($input: CreateOrEditEventInput!) {
          createEvent(input: $input) {
            id
          }
        }
      `),
      variables: {
        input: { title, dateTime, location },
      },
    });

    assertSingleValue(createdEvent);

    expect(createdEvent.errors).toBeUndefined();
    expect(createdEvent.data?.createEvent.id).toBeDefined();

    const id = createdEvent.data?.createEvent.id;

    if (id === undefined) {
      throw new Error("Expected id to be defined");
    }

    const result = await executor({
      document: gql(/* GraphQL */ `
        query Test3($id: UUID!) {
          eventById(id: $id) {
            title
            emailRegistrations {
              email
            }
          }
        }
      `),
      variables: {
        id,
      },
    });

    assertSingleValue(result);
    expect(result.errors).toBeUndefined();
    expect(result.data?.eventById.emailRegistrations).toHaveLength(0);
  });

  it("returns array with the registration when there is only one registration for the event", async () => {
    const { title, dateTime, location } = createEventData(
      "title",
      "location",
      inFourWeeks(),
    );
    // create event
    const createdEvent = await executor({
      document: gql(/* GraphQL */ `
        mutation Test2($input: CreateOrEditEventInput!) {
          createEvent(input: $input) {
            id
          }
        }
      `),
      variables: {
        input: { title, dateTime, location },
      },
    });

    assertSingleValue(createdEvent);

    expect(createdEvent.errors).toBeUndefined();
    expect(createdEvent.data?.createEvent.id).toBeDefined();

    const id = createdEvent.data?.createEvent.id;

    if (id === undefined) {
      throw new Error("Expected id to be defined");
    }

    await executor({
      document: gql(/* GraphQL */ `
        mutation Test2Register($input: MutationRegisterToEventByEmailInput!) {
          registerToEventByEmail(input: $input) {
            createdAt
          }
        }
      `),
      variables: {
        input: {
          email: "plupp@apasnor.com",
          eventId: id,
          firstName: "Plupp",
          lastName: "Apasnor",
        },
      },
    });

    const result = await executor({
      document: gql(/* GraphQL */ `
        query Test3($id: UUID!) {
          eventById(id: $id) {
            title
            emailRegistrations {
              email
            }
          }
        }
      `),
      variables: {
        id,
      },
    });

    assertSingleValue(result);
    console.error(result.errors);
    expect(result.errors).toBeUndefined();
    expect(result.data?.eventById.emailRegistrations).toHaveLength(1);
    expect(result.data?.eventById.emailRegistrations[0]).toHaveProperty(
      "email",
    );
  });
});

describe("register by email", () => {
  it.todo("creates registration, when there are no other registrations");
  it.todo(
    "creates registration, when there are no registrations with the given email",
  );
  it.todo(
    "throws error, when there already exists a registration with the given email",
  );
  it.todo("throws error, when the event does not exist");
  it.todo("throws error, when the event has already started");
  it.todo("throws error, when the event has closed for registration");
  it.todo("throws error, when the event has not yet opened for registration");
  it.todo("throws error, when the event has not yet been published");
});

describe("get all email registrations for event", () => {
  it.todo(
    "returns registrations, when there is more than one registration for the given event",
  );
  it.todo(
    "returns the registration, when there is only one registration for the given event",
  );
  it.todo(
    "returns empty array, when there are no registrations for the given event",
  );
  it.todo(
    "throws error, when there are more than one registration with the given email",
  );
});

describe("get registrations by email", () => {
  it.todo(
    "returns empty array, when there are no registrations for the given email",
  );
  it.todo("returns registration, when there is only one unique email");
  it.todo(
    "throws error, when there are two registrations for the same event, with identical emails",
  );
  it.todo("throws error, when the given email is invalid");
});
