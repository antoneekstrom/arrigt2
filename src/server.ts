/**
 * @file Creates the server instance.
 */

import express, { Express } from "express";
import { yogaRequestHandler } from "./yoga.ts";
import { remixRequestHandler } from "./remix.ts";
import { createServer, Server } from "http";

/**
 * Returns the configured express server instance.
 * This includes the graphql and remix request handlers, and a websocket server for graphql subscriptions.
 */
export default function serve() {
  const app = express();

  const httpServer = createHttpServer(app);

  addRemixRequestHandler(app);
  addYogaRequestHandler(app);

  start(httpServer);
}

/**
 * Adds the yoga GraphQL request handler.
 */
function addYogaRequestHandler(app: Express) {
  app.all(yogaRequestHandler.graphqlEndpoint, yogaRequestHandler);
}

/**
 * Adds the remix request handler and serves the static frontend javascript that is emitted by remix.
 */
function addRemixRequestHandler(app: Express) {
  app.use(express.static("public"));
  app.all("/", remixRequestHandler);
}

function start(httpServer: Server) {
  const port = process.env.PORT_BACKEND ?? 4000;
  httpServer.listen(port, () => {
    console.info(`Running in ${process.env.NODE_ENV} mode..`);
    console.info(`Listening on ${port}`);
    console.info(
      `Serving GraphQL endpoint at ${yogaRequestHandler.graphqlEndpoint} 😎👌`,
    );
  });
}

function createHttpServer(app: Express) {
  return createServer(app);
}
