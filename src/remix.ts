/**
 * @file Configures and exports the remix request handler.
 */

import express, { Express } from "express";
import { createRequestHandler } from "@remix-run/express";

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

/**
 * Adds the remix request handler and serves the static frontend javascript that is emitted by remix.
 */
export async function addRemix(app: Express) {
  if (viteDevServer) {
    app.use(viteDevServer.middlewares);
  } else {
    app.use(
      "/assets",
      express.static("build/client/assets", {
        immutable: true,
        maxAge: "1y",
      }),
    );
  }
  app.use(express.static("build/client", { maxAge: "1h" }));
  app.all(
    "*",
    createRequestHandler({
      build: viteDevServer
        ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
        : await import("./build/server/index.js"),
    }),
  );
}
