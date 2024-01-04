/**
 * @file Configures and exports the prisma client.
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { PubSub } from "./yoga";
import {
  DefaultArgs,
  PrismaClientInitializationError,
  PrismaClientOptions,
} from "@prisma/client/runtime/library";
import { GraphQLError } from "graphql";

/**
 * Can be either a PrismaClient or a PrismaClient with extensions.
 */
export type AnyPrismaClient = PrismaClient<
  PrismaClientOptions,
  unknown,
  DefaultArgs
>;

/**
 * Prisma client singleton instance.
 */
const prisma = new PrismaClient({});

/**
 * Injects the given query arguments along with
 * the normal arguments that are given when calling the query.
 * @param extra the arguments to add
 * @returns the prisma extension
 */
export function injectQueryArgsExtension(extra: {
  include?: unknown;
  select?: unknown;
}) {
  return Prisma.defineExtension({
    name: injectQueryArgsExtension.name,
    query: {
      $allOperations({ args, query }) {
        console.log("Injecting query args: ", JSON.stringify(extra));
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
 * @param model
 * @param operation
 * @param id
 * @returns
 */
export function createSubscriptionEventString(
  model: string,
  operation: string,
  id?: string,
) {
  return id ? `${model}/${operation}/${id}` : `${model}/${operation}`;
}

function isMutatingOperation(operation: string): boolean {
  return ["create", "update", "delete"].some((op) => operation.includes(op));
}

/**
 * Publishes events to the given pubsub instance when a create, update or delete operation is performed.
 * @param pubsub
 * @returns the prisma extension
 */
export function pubsubExtension(pubsub: PubSub) {
  return Prisma.defineExtension({
    name: pubsubExtension.name,
    query: {
      $allModels: {},
      async $allOperations({ args, query, operation, model }) {
        if (!model) {
          return query(args);
        }

        // Execute query before publishing event, so subscribers can refetch the new data
        const result = await query(args).catch((err) => {
          if (err instanceof PrismaClientInitializationError) {
            return Promise.reject(
              new GraphQLError("Could not connect to database."),
            );
          }
          return Promise.reject(err);
        });

        if (isMutatingOperation(operation)) {
          const event = createSubscriptionEventString(
            model,
            operation,
            args.where?.id,
          );
          pubsub.publish(event);
        }

        return result;
      },
    },
  });
}

type DelegateConstructor<T extends PrismaDelegate> = new (
  prisma: AnyPrismaClient,
) => T;

/**
 * Contains a specific instance of a prisma client, so that it doesn't have to be passed around in case
 * we need to extend clients.
 */
export class PrismaDelegate {
  constructor(protected readonly prisma: AnyPrismaClient) {}

  /**
   * Injects the given query arguments along with
   * the normal arguments that are given when calling the query.
   * @param args the arguments to add
   * @returns this
   */
  injectQueryArgs(args: Parameters<typeof injectQueryArgsExtension>[0]) {
    const ctor = this.constructor as DelegateConstructor<this>;
    return new ctor(
      this.prisma.$extends(injectQueryArgsExtension(args)) as AnyPrismaClient,
    );
  }
}

export default prisma;
