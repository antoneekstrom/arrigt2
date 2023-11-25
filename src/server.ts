import express from "express";
import { yogaRequestHandler } from "./yoga.ts";
import { remixRequestHandler } from "./remix.ts";

export default function serve() {
  const app = express();
  const port = process.env.PORT_BACKEND ?? 4000;

  app.all("/", remixRequestHandler);
  app.all(yogaRequestHandler.graphqlEndpoint, yogaRequestHandler);

  app.listen(port, () => {
    console.info(`Running in ${process.env.NODE_ENV} mode..`);
    console.info(`Listening on ${port}`);
    console.info(
      `Serving GraphQL endpoint at ${yogaRequestHandler.graphqlEndpoint} 😎👌`,
    );
  });
}
