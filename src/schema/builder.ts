/**
 * @file Configures and exports the pothos schema builder.
 * The schema builder exported here does not have any types defined. The object types are appended by the other files in this directory.
 */

import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import SmartSubscriptionsPlugin, {
  subscribeOptionsFromIterator,
} from "@pothos/plugin-smart-subscriptions";
import { YogaContext } from "../yoga.ts";
import WithInputPlugin from "@pothos/plugin-with-input";
import prisma from "../prisma.ts";
import { DateResolver } from "graphql-scalars";

const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: YogaContext;
  Scalars: {
    Date: { Input: Date; Output: Date };
  };
}>({
  plugins: [PrismaPlugin, SmartSubscriptionsPlugin, WithInputPlugin],
  smartSubscriptions: {
    ...subscribeOptionsFromIterator((name, { pubsub }) => {
      return pubsub.subscribe(name);
    }),
  },
  prisma: {
    client: prisma,
    // use where clause from prismaRelatedConnection for totalCount (will true by default in next major version)
    filterConnectionTotalCount: true,
    // warn when not using a query parameter correctly
    onUnusedQuery: process.env.NODE_ENV === "production" ? null : "warn",
  },
});

builder.addScalarType("Date", DateResolver, {});

builder.queryType();
builder.mutationType();
builder.subscriptionType();

export default builder;
