/**
 * @file Configures and exports the pothos schema builder.
 * The schema builder exported here does not have any types defined. The object types are appended by the other files in this directory.
 */

import type PrismaTypes from "@pothos/plugin-prisma/generated";
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import ValidationPlugin from "@pothos/plugin-validation";
import WithInputPlugin from "@pothos/plugin-with-input";
import ComplexityPlugin from "@pothos/plugin-complexity";
import SmartSubscriptionsPlugin, {
  subscribeOptionsFromIterator,
} from "@pothos/plugin-smart-subscriptions";
import { YogaContext } from "../yoga.ts";
import prisma from "../prisma.ts";
import {
  DateTimeResolver,
  EmailAddressResolver,
  UUIDResolver,
} from "graphql-scalars";

/**
 * Describes the types that are available in the schema.
 */
interface SchemaTypes {
  PrismaTypes: PrismaTypes;
  Context: YogaContext;
  DefaultInputFieldRequiredness: true;
}

/**
 * The schema builder instance.
 */
const builder = new SchemaBuilder<SchemaTypes>({
  defaultInputFieldRequiredness: true,
  plugins: [
    PrismaPlugin,
    SmartSubscriptionsPlugin,
    WithInputPlugin,
    ValidationPlugin,
    ComplexityPlugin,
  ],
  validationOptions: {
    validationError: (zodError) => zodError,
  },
  smartSubscriptions: {
    ...subscribeOptionsFromIterator((name, { pubsub }) => {
      return pubsub.subscribe(name);
    }),
  },
  prisma: {
    client: prisma,
    filterConnectionTotalCount: true,
    onUnusedQuery: process.env.NODE_ENV === "production" ? null : "warn",
  },
  complexity: {
    defaultComplexity: 1,
    defaultListMultiplier: 10,
    limit: {
      complexity: 500,
      depth: 10,
      breadth: 50,
    },
  },
});

// Add scalars to the schema type
interface SchemaTypes {
  Scalars: {
    DateTime: { Input: Date; Output: Date };
    Email: { Input: string; Output: string };
    UUID: { Input: string; Output: string };
  };
}

// Add scalars to the schema builder
builder.addScalarType("DateTime", DateTimeResolver, {});
builder.addScalarType("Email", EmailAddressResolver, {});
builder.addScalarType("UUID", UUIDResolver, {});

// Add the query, mutation and subscription types to the schema builder
builder.queryType();
builder.mutationType();
builder.subscriptionType();

export default builder;
