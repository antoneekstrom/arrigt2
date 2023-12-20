/**
 * @file Configures and exports the prisma client.
 */

import { PrismaClient } from "@prisma/client";

type ResolverQueryArgs = {
  include?: unknown;
  select?: unknown;
};

type AnyPrismaClient =
  | PrismaClient
  | ReturnType<typeof extendWithResolverQueryArgs>;

const prisma = new PrismaClient({});

/**
 * Returns an extended prisma client that inserts the given query arguments
 * before the normal arguments that are given when calling the query.
 * @param prisma the prisma client to extend
 * @param argsBefore the arguments to add before the normal arguments
 * @returns the extended prisma client
 */
export function extendWithResolverQueryArgs(
  prisma: PrismaClient,
  argsBefore: ResolverQueryArgs,
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

export class PrismaDelegate {
  constructor(protected readonly prisma: AnyPrismaClient) {}

  static fromSingleton<T extends PrismaDelegate>(delegate: {
    new (prisma: AnyPrismaClient): T;
  }): T {
    return new delegate(prisma);
  }

  static fromResolverArgs<T extends PrismaDelegate>(
    delegate: {
      new (prisma: AnyPrismaClient): T;
    },
    args: ResolverQueryArgs,
  ): T {
    return new delegate(extendWithResolverQueryArgs(prisma, args));
  }
}

export default prisma;
