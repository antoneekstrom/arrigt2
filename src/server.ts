import express from "express";
import { yogaRequestHandler } from "./yoga.ts";
import { remixRequestHandler } from "./remix.ts";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { useServer as wrapServer } from "graphql-ws/lib/use/ws";

export default function serve() {
  const app = express();
  const port = process.env.PORT_BACKEND ?? 4000;

  app.use(express.static("public"));
  app.all(yogaRequestHandler.graphqlEndpoint, yogaRequestHandler);
  app.all("/", remixRequestHandler);

  const httpServer = createServer(app);
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: yogaRequestHandler.graphqlEndpoint,
  });

  wrapServer(
    {
      // @ts-expect-error should always exist
      execute: (args) => args.rootValue.execute(args),
      // @ts-expect-error should always exist
      subscribe: (args) => args.rootValue.subscribe(args),
      onSubscribe: async (ctx, msg) => {
        const { schema, execute, subscribe, contextFactory, parse, validate } =
          yogaRequestHandler.getEnveloped({
            ...ctx,
            req: ctx.extra.request,
            socket: ctx.extra.socket,
            params: msg.payload,
          });

        const args = {
          schema,
          operationName: msg.payload.operationName,
          document: parse(msg.payload.query),
          variableValues: msg.payload.variables,
          contextValue: await contextFactory(),
          rootValue: {
            execute,
            subscribe,
          },
        };

        const errors = validate(args.schema, args.document);
        if (errors.length) return errors;
        return args;
      },
    },
    wsServer,
  );

  httpServer.listen(port, () => {
    console.info(`Running in ${process.env.NODE_ENV} mode..`);
    console.info(`Listening on ${port}`);
    console.info(
      `Serving GraphQL endpoint at ${yogaRequestHandler.graphqlEndpoint} 😎👌`,
    );
  });
}
