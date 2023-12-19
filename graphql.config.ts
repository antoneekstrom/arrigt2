import type { IGraphQLConfig } from "graphql-config";

export default {
  schema: process.env.CI === "true" ? "schema.graphql" : "http://localhost:4000/graphql",
  documents: ["./app/**/*.{ts,tsx}", "./test/**/*.{ts,tsx}"]
} satisfies IGraphQLConfig;
