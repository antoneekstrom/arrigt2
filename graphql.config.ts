import type { IGraphQLConfig } from "graphql-config";

export default {
  schema: "http://localhost:4000/graphql",
  documents: "./app/**/*.{ts,tsx}",
} satisfies IGraphQLConfig;
