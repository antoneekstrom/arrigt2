import type { CodegenConfig } from "@graphql-codegen/cli";
import type { IGraphQLConfig } from "graphql-config";
import config from "./graphql.config";
import { DateTimeResolver } from "graphql-scalars";

export default {
  ...config,
  generates: {
    "./app/__generated__/graphql/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
      },
      config: {
        scalars: {
          DateTime: DateTimeResolver.extensions.codegenScalarType,
        },
      },
    },
  },
} satisfies IGraphQLConfig & CodegenConfig;
