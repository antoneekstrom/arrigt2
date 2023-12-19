import type { CodegenConfig } from "@graphql-codegen/cli";
import type { IGraphQLConfig } from "graphql-config";
import config from "./graphql.config";
import {
  DateTimeResolver,
  EmailAddressResolver,
  UUIDResolver,
} from "graphql-scalars";

export default {
  ...config,
  schema: ["./src/schema/index.ts"],
  require: ["esbuild-register"],
  generates: {
    "schema.graphql": {
      plugins: ["schema-ast"],
    },
    "./app/__generated__/graphql/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
      },
      config: {
        scalars: {
          DateTime: DateTimeResolver.extensions.codegenScalarType,
          UUID: UUIDResolver.extensions.codegenScalarType,
          Email: EmailAddressResolver.extensions.codegenScalarType,
        },
      },
    },
  },
} satisfies IGraphQLConfig & CodegenConfig;
