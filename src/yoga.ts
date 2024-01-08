/**
 * @file Configures and exports the GraphQL Yoga request handler.
 */

import { createPubSub, createYoga, YogaInitialContext } from "graphql-yoga";
import schema from "./schema";

/**
 * Keeps track of GraphQL subscriptions.
 * @see https://the-guild.dev/graphql/yoga-server/docs/features/subscriptions#pubsub
 */
export type PubSub = ReturnType<typeof createPubSub>;

/**
 * Instantiates an extended Prisma client and model classes for interacting with the database.
 * This context is available to all GraphQL resolvers.
 * @returns Initial GraphQL context
 */
const createInitialContext = () => {
  return {
    pubsub: createPubSub() as PubSub,
  };
};

/**
 * Handles GraphQL requests.
 */
export const yogaRequestHandler = createYoga({
  schema,
  graphiql: process.env.NODE_ENV === "development",
  graphqlEndpoint: process.env.ENDPOINT_GRAPHQL,
  context: createInitialContext(),
});

/**
 * Describes the GraphQL context.
 */
export type YogaContext = YogaInitialContext &
  ReturnType<typeof createInitialContext>;
