import { describe, expect, it } from "vitest";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { createYoga } from "graphql-yoga";
import schema from "./schema";
import { parse } from "graphql";

function assertSingleValue<TValue extends object>(
  value: TValue | AsyncIterable<TValue>,
): asserts value is TValue {
  if (Symbol.asyncIterator in value) {
    throw new Error("Expected single value");
  }
}

describe("examples", () => {
  it("responds with 'apa snor'", async () => {
    const yoga = createYoga({ schema });
    const executor = buildHTTPExecutor({
      fetch: yoga.fetch,
    });

    const result = await executor({
      document: parse(/* GraphQL */ `
        query {
          plupp
        }
      `),
    });

    assertSingleValue(result);
    expect(result.data.plupp).toBe("apa snor");
  });
});
