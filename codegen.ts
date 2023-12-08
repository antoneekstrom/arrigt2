import type { CodegenConfig } from "@graphql-codegen/cli";
import type { IGraphQLConfig } from "graphql-config";
import config from "./graphql.config";

export default {
  ...config,
  generates: {
    "./app/__generated__/graphql/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
} satisfies IGraphQLConfig & CodegenConfig;
