/**
 * @file Configures and exports the GraphQL Yoga request handler.
 */

import { createPubSub, createYoga, YogaInitialContext } from "graphql-yoga";
import schema from "./schema";

const initialContext = {
  // Keeps track of GraphQL subscriptions
  pubsub: createPubSub(),
};

export const yogaRequestHandler = createYoga({
  schema,
  graphiql: process.env.NODE_ENV === "development",
  graphqlEndpoint: process.env.ENDPOINT_GRAPHQL,
  context: initialContext,
});

/**
 * Describes the GraphQL context.
 */
export type YogaContext = YogaInitialContext & typeof initialContext;
