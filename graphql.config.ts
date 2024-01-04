import type { IGraphQLConfig } from "graphql-config";

export default {
  schema: "schema.graphql",
  documents: ["./app/**/*.{ts,tsx}", "./test/**/*.{ts,tsx}"]
} satisfies IGraphQLConfig;
