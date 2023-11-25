import { createYoga } from "graphql-yoga";
import schema from "./schema.ts";

export const yogaRequestHandler = createYoga({
  schema,
  graphiql: process.env.NODE_ENV === "development",
  graphqlEndpoint: process.env.ENDPOINT_GRAPHQL,
});
