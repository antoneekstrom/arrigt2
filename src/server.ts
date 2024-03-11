/**
 * @file Creates the server instance.
 */

import express, { Express } from "express";
import { addYoga, yogaRequestHandler } from "./yoga.ts";
import { addRemix } from "./remix.ts";
import { createServer, Server } from "http";
/**
 * Returns the configured express server instance.
 * This includes the graphql and remix request handlers.
 */
export default function serve() {
  const app = express();

  const httpServer = createHttpServer(app);

  addYoga(app);
  addRemix(app);

  start(httpServer);
}

function start(httpServer: Server) {
  const port = process.env.PORT_BACKEND ?? 4000;
  const host = "http://localhost";
  const graphlEndpoint = `${host}:${port}${yogaRequestHandler.graphqlEndpoint}`;
  const remixEndpoint = `${host}:${port}`;

  httpServer.listen(port, () => {
    console.info(`Running in ${process.env.NODE_ENV} mode`);
    console.info(`Listening on ${port}`);
    console.info(`Serving GraphQL at ${graphlEndpoint} 😎👌`);
    console.info(`Serving Remix at ${remixEndpoint} 😤🤘`);
  });
}

function createHttpServer(app: Express) {
  return createServer(app);
}
