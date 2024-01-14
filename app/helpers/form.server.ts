import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { Submission } from "@conform-to/react";
import { fetchQuery } from "./fetch.server";
import { parseFormData, shouldSubmit } from "./data.server";
import { Params } from "@remix-run/react";

/**
 *
 * @param args
 * @param options
 * @returns
 */
export async function loadQuery<
  TParams extends Record<string, unknown>,
  TResult,
>(
  args: LoaderFunctionArgs,
  options: {
    query: TypedDocumentNode<TResult, TParams>;
    paramSchema?: z.ZodSchema<TParams>;
  },
) {
  const { query, paramSchema } = options;
  const params = paramSchema && parseParams(args.params, paramSchema);
  return await fetchQuery(query, params?.data);
}

/**
 *
 * @param args
 * @param options
 * @returns
 */
export async function loadMutation<
  TParams extends Record<string, unknown>,
  TFormData extends Record<string, unknown>,
  TResult,
>(
  args: ActionFunctionArgs,
  options: {
    query: TypedDocumentNode<TResult, TParams & TFormData>;
    paramSchema?: z.ZodSchema<TParams>;
    formDataSchema: z.ZodSchema<TFormData>;
  },
): Promise<
  Submission<TFormData> & {
    data?: TResult;
  }
> {
  const { query, formDataSchema, paramSchema } = options;
  const submission = await parseFormData(args.request, formDataSchema);
  const params = paramSchema && parseParams(args.params, paramSchema);

  if (!shouldSubmit(submission)) {
    return submission;
  }

  const variables = {
    ...(params?.data as TParams),
    ...submission.value,
  };

  const response = await fetchQuery(query, variables);

  // if (response.errors) {
  //   return {
  //     ...submission,
  //     error: Object.fromEntries(
  //       response.errors.map((error) => [error.name, [error.message]]),
  //     ),
  //   };
  // }

  return {
    ...submission,
    data: response.data,
  };
}

function parseParams<TParams>(
  params: Params<string>,
  paramSchema: z.ZodSchema<TParams>,
) {
  const result = paramSchema?.safeParse(params);

  if (result?.success !== undefined && result?.success === false) {
    throw new Error(result?.error.message);
  }

  return result;
}
