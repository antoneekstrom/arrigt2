import type { IGraphQLConfig } from "graphql-config";
import { printSchema } from "graphql";
import schema from "./src/schema.ts";

export default {
  schema: printSchema(schema),
  documents: "./src/**/*.{ts,tsx}",
} satisfies IGraphQLConfig;
