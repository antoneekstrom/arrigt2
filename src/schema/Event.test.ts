import { describe, expect, it, vi } from "vitest";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { createYoga } from "graphql-yoga";
import { parse } from "graphql";
import prisma from "../__mock__/prisma.ts";
import builder from "./builder.ts";
import "./Event";

vi.mock("../prisma");

function assertSingleValue<TValue extends object>(
  value: TValue | AsyncIterable<TValue>,
): asserts value is TValue {
  if (Symbol.asyncIterator in value) {
    throw new Error("Expected single value");
  }
}

describe("Events", () => {
  it("returns a list of events", async () => {
    const events = [
      {
        id: "plupp",
        title: "AAAHHH",
        dateTime: new Date(Date.now()),
        location: "awdawdubawd",
      },
    ];
    prisma.event.findMany.mockResolvedValue(events);

    const yoga = createYoga({ schema: builder.toSchema() });
    const executor = buildHTTPExecutor({
      fetch: yoga.fetch,
    });

    const result = await executor({
      document: parse(/* GraphQL */ `
        query {
          allEvents {
            id
          }
        }
      `),
    });

    assertSingleValue(result);
    expect(result).toBe(events);
  });
});
