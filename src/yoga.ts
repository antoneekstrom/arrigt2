/**
 * @file Configures and exports the GraphQL Yoga request handler.
 */

import { createPubSub, createYoga, YogaInitialContext } from "graphql-yoga";
import prisma, { pubsubExtension } from "./prisma";
import schema from "./schema";
import { Events } from "./model/events";
import { Registrations } from "./model/registrations";

export type PubSub = ReturnType<typeof createPubSub>;

const createInitialContext = () => {
  const pubsub = createPubSub<{
    [model: string]: [string];
  }>();
  return {
    // Keeps track of GraphQL subscriptions
    pubsub,
    events: new Events(prisma.$extends(pubsubExtension(pubsub))),
    registrations: new Registrations(prisma.$extends(pubsubExtension(pubsub))),
  };
};

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
