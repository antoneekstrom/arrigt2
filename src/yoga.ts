import { createPubSub, createYoga, YogaInitialContext } from "graphql-yoga";
import builder from "./schema/builder";

const initialContext = {
  pubsub: createPubSub(),
};

export const yogaRequestHandler = createYoga({
  schema: builder.toSchema(),
  graphiql: process.env.NODE_ENV === "development" && {
    subscriptionsProtocol: "WS",
  },
  graphqlEndpoint: process.env.ENDPOINT_GRAPHQL,
  context: initialContext,
});

export type YogaContext = YogaInitialContext & typeof initialContext;
