/**
 * @file Configures and exports the prisma client.
 */

import { PrismaClient } from "@prisma/client";

type QueryArgs = {
  include?: unknown;
  select?: unknown;
};

/**
 * Returns an extended prisma client that inserts the given query arguments
 * before the normal arguments that are given when calling the query.
 * @param prisma the prisma client to extend
 * @param argsBefore the arguments to add before the normal arguments
 * @returns the extended prisma client
 */
export function extendWithQueryArgsBefore(
  prisma: PrismaClient,
  argsBefore: QueryArgs,
) {
  return prisma.$extends({
    query: {
      $allOperations({ args, query }) {
        return query({
          ...argsBefore,
          ...args,
        });
      },
    },
  });
}

export type AnyPrismaClient =
  | PrismaClient
  | ReturnType<typeof extendWithQueryArgsBefore>;

export default new PrismaClient({});
