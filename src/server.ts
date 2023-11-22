import { createYoga } from "graphql-yoga";
import schema from "./schema.ts";

export const yogaRequestHandler = createYoga({
  schema,
  graphiql: Bun.env.GRAPHIQL === "true",
  graphqlEndpoint: Bun.env.ENDPOINT_GRAPHQL,
});

export default function serve() {
  const server = Bun.serve({
    fetch: yogaRequestHandler,
    port: Bun.env.PORT_BACKEND,
  });

  const graphqlEndpointUrl = new URL(
    yogaRequestHandler.graphqlEndpoint,
    `http://${server.hostname}:${server.port}`,
  );

  console.info(`Server is running on ${graphqlEndpointUrl} 😎👌`);
}
