/**
 * @file Configures and exports the remix request handler.
 */

import { createRequestHandler } from "@remix-run/express";
import * as build from "../build/index.js";

export const remixRequestHandler = createRequestHandler({
  build: build as never,
  getLoadContext() {
    return {};
  },
});
