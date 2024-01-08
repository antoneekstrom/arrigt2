import { Prisma } from "@prisma/client";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { GraphQLError } from "graphql";
import { PubSub } from "../../yoga";

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
export function createPubSubExtension(pubsub: PubSub) {
  return Prisma.defineExtension({
    name: createPubSubExtension.name,
    query: {
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
