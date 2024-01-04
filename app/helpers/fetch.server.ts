import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { yogaRequestHandler } from "../../src/yoga";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { ExecutionResult } from "graphql";

const executor = buildHTTPExecutor({
  fetch: yogaRequestHandler.fetch,
});

/**
 * Perform a GraphQL query against the Yoga server.
 * @param document GraphQL document to execute
 * @param variables Variables to pass to the query
 * @returns The result of the query
 */
export async function fetchQuery<
  TResult,
  TVariables extends Record<string, unknown>,
>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
): Promise<ExecutionResult<TResult>> {
  const response = await executor({
    document,
    variables,
  });

  assertSingleValue(response);

  return response;
}

export function isAsyncIterable<T extends object>(
  value: AsyncIterable<T> | T,
): value is AsyncIterable<T> {
  return Symbol.asyncIterator in value;
}

export function assertSingleValue<T extends object>(
  value: AsyncIterable<T> | T,
): asserts value is T {
  if (isAsyncIterable(value)) {
    throw new Error("Expected single value.");
  }
}
