/**
 * @file Configures and exports the `Event` object type.
 */

import builder from "../builder.ts";
import {
  EventSchema,
  createEventData,
  eventSchemaRequired,
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
  subscribe(subscriptions, parent, { events }) {
    subscriptions.register("Event", {
      refetch: () => events.findById(parent.id),
    });
  },
});

builder.queryFields((t) => ({
  allEvents: t.prismaField({
    type: ["Event"],
    resolve: async (query, _parent, _args, { events }) =>
      await events.injectQueryArgs(query).findAll(),
    smartSubscription: true,
    subscribe(subscriptions) {
      subscriptions.register("Event");
    },
  }),
  eventById: t.prismaField({
    type: "Event",
    args: {
      id: t.arg({ type: "UUID", required: true }),
    },
    resolve: async (query, _, { id }, { events }) =>
      await events.injectQueryArgs(query).findById(id),
    smartSubscription: true,
    subscribe(subscriptions) {
      subscriptions.register("Event");
    },
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
    resolve: async (query, _, { input, id }, { events }) => {
      const event = createEventData(
        input.title,
        input.location,
        input.dateTime,
        input.isPublishedAt ?? undefined,
        input.opensForRegistrationsAt ?? undefined,
      );
      const result = await events.injectQueryArgs(query).updateById(id, event);
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
    resolve: async (query, _, { input }, { events }) => {
      const event = createEventData(
        input.title,
        input.location,
        input.dateTime,
        input.isPublishedAt ?? undefined,
        input.opensForRegistrationsAt ?? undefined,
      );
      const result = await events.injectQueryArgs(query).create(event);
      return result;
    },
  }),
}));
