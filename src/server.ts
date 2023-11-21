import { createYoga } from "graphql-yoga";
import schema from "./schema.ts";

export const yogaRequestHandler = createYoga({ schema, graphiql: true });

export default function serve() {
  const server = Bun.serve({
    fetch: yogaRequestHandler,
    port: 4000,
  });

  const graphqlEndpointUrl = new URL(
    yogaRequestHandler.graphqlEndpoint,
    `http://${server.hostname}:${server.port}`,
  );

  console.info(`Server is running on ${graphqlEndpointUrl} 😎👌`);
}
