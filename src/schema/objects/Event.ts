/**
 * @file Configures and exports the `Event` object type.
 */

import builder from "../builder.ts";
import prisma, { PrismaDelegate } from "../../prisma.ts";
import {
  EventSchema,
  createEventData,
  eventSchemaRequired,
  Events,
} from "../../model/events.ts";

builder.prismaObject("Event", {
  fields: (t) => ({
    id: t.expose("id", { type: "UUID" }),
    title: t.exposeString("title"),
    location: t.exposeString("location"),
    dateTime: t.expose("dateTime", {
      type: "DateTime",
    }),
    isPublishedAt: t.expose("isPublishedAt", {
      type: "DateTime",
    }),
    opensForRegistrationsAt: t.expose("opensForRegistrationsAt", {
      type: "DateTime",
    }),
    closesForRegistrationsAt: t.expose("closesForRegistrationsAt", {
      type: "DateTime",
    }),
    createdAt: t.expose("createdAt", {
      type: "DateTime",
    }),
    emailRegistrations: t.relation("emailRegistrations"),
  }),
  subscribe(subscriptions, parent, _, info) {
    subscriptions.register(`${info.parentType.name}/Edit/${parent.id}`, {
      refetch: () => new Events(prisma).findById(parent.id),
    });
  },
});

builder.queryFields((t) => ({
  allEvents: t.prismaField({
    type: ["Event"],
    resolve: async (query) =>
      await PrismaDelegate.fromResolverArgs(Events, query).findAll(),
    smartSubscription: true,
    subscribe(subscriptions) {
      subscriptions.register(`Event/Create`);
    },
  }),
  eventById: t.prismaField({
    type: "Event",
    args: {
      id: t.arg({ type: "UUID", required: true }),
    },
    resolve: async (query, _, { id }) =>
      await PrismaDelegate.fromResolverArgs(Events, query).findById(id),
  }),
}));

const CreateOrEditEventInput = builder
  .inputRef<
    Partial<EventSchema> & Pick<EventSchema, "title" | "location" | "dateTime">
  >("CreateOrEditEventInput")
  .implement({
    fields: (t) => ({
      title: t.string({ required: true }),
      location: t.string({ required: true }),
      dateTime: t.field({
        type: "DateTime",
        required: true,
      }),
      opensForRegistrationsAt: t.field({
        type: "DateTime",
        required: false,
      }),
      closesForRegistrationsAt: t.field({
        type: "DateTime",
        required: false,
      }),
      isPublishedAt: t.field({
        type: "DateTime",
        required: false,
      }),
    }),
    validate: {
      schema: eventSchemaRequired,
    },
  });

builder.mutationFields((t) => ({
  editEvent: t.prismaField({
    type: "Event",
    args: {
      id: t.arg({ type: "UUID", required: true }),
      input: t.arg({
        type: CreateOrEditEventInput,
        required: true,
      }),
    },
    resolve: async (query, _, { input, id }, ctx) => {
      const result = await PrismaDelegate.fromResolverArgs(
        Events,
        query,
      ).updateById(
        id,
        createEventData(
          input.title,
          input.location,
          input.dateTime,
          input.isPublishedAt ?? undefined,
          input.opensForRegistrationsAt ?? undefined,
        ),
      );
      ctx.pubsub.publish(`Event/Edit/${id}`);
      return result;
    },
  }),
  createEvent: t.prismaField({
    type: "Event",
    args: {
      input: t.arg({
        type: CreateOrEditEventInput,
        required: true,
      }),
    },
    resolve: async (query, _, { input }, ctx) => {
      const result = await PrismaDelegate.fromResolverArgs(
        Events,
        query,
      ).create(
        createEventData(
          input.title,
          input.location,
          input.dateTime,
          input.isPublishedAt ?? undefined,
          input.opensForRegistrationsAt ?? undefined,
        ),
      );
      ctx.pubsub.publish(`Event/Create`);
      return result;
    },
  }),
}));
