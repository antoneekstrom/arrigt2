/**
 * @file Configures and exports the prisma client.
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { DynamicClientExtensionThis } from "@prisma/client/runtime/library";
import { PubSub } from "./yoga";

type AnyPrismaClient =
  | PrismaClient
  | DynamicClientExtensionThis<
      Prisma.TypeMap,
      Prisma.TypeMapCb,
      Record<string, unknown>
    >;

const prisma = new PrismaClient({});

/**
 * Returns a prisma client extension that injects the given query arguments along with
 * the normal arguments that are given when calling the query.
 * @param extra the arguments to add
 * @returns the extended prisma client
 */
export function injectQueryArgsExtension(extra: {
  include?: unknown;
  select?: unknown;
}) {
  return Prisma.defineExtension({
    name: injectQueryArgsExtension.name,
    query: {
      $allOperations({ args, query }) {
        return query({
          ...extra,
          ...args,
        });
      },
    },
  });
}

/**
 *
 * @param pubsub
 * @returns
 */
export function pubsubExtension(pubsub: PubSub) {
  return Prisma.defineExtension({
    name: pubsubExtension.name,
    query: {
      $allModels: {},
      $allOperations({ args, query, operation, model }) {
        if (
          !operation.includes("create") &&
          !operation.includes("update") &&
          !operation.includes("delete")
        ) {
          console.log("Skipping publish event: ", operation);
          return query(args);
        }

        if (model) {
          console.log(`Publishing event: ${model}/${operation}`);
          pubsub.publish(model, operation);
        }

        return query(args);
      },
    },
  });
}

type DelegateConstructor<T extends PrismaDelegate> = new (
  prisma: AnyPrismaClient,
) => T;

/**
 *
 */
export class PrismaDelegate {
  constructor(protected readonly prisma: AnyPrismaClient) {}

  static fromSingleton<T extends PrismaDelegate>(
    delegate: DelegateConstructor<T>,
  ): T {
    return new delegate(prisma);
  }

  static fromResolverArgs<T extends PrismaDelegate>(
    delegate: DelegateConstructor<T>,
    args: Parameters<typeof injectQueryArgsExtension>[0],
  ): T {
    const extendedClient = prisma.$extends(injectQueryArgsExtension(args));
    return new delegate(extendedClient);
  }

  injectQueryArgs(args: Parameters<typeof injectQueryArgsExtension>[0]) {
    this.prisma.$extends(injectQueryArgsExtension(args));
    return this;
  }
}

export default prisma;
