/**
 * @file Configures and exports the remix request handler.
 */

import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import * as build from "../build/index.js";

/**
 * tells remix that the server is ready to receive requests.
 * Should be called after the server has started, and only in development mode. Enables HMR and HDR.
 */
export function remixReady() {
  broadcastDevReady(build as never);
}

/**
 * The request handler that serves remix.
 */
export const remixRequestHandler = createRequestHandler({
  build: build as never,
  mode: build.mode,
  getLoadContext() {
    return {};
  },
});
