/**
 * @file Configures and exports the `Event` object type.
 */

import { z } from "zod";
import builder from "../builder.ts";
import { defaultEventData, isEventValid } from "../../model/events.ts";
import { subscribeObjectType } from "../helpers.ts";
import { Event } from "@prisma/client";

const subscribe = subscribeObjectType<Event>(
  (event) => event.id,
  ({ id }, { events }) => events.findById(id),
);

export const EventObjectType = builder.prismaObject("Event", {
  subscribe,
  fields: (t) => ({
    id: t.expose("id", { type: "UUID" }),
    title: t.exposeString("title"),
    location: t.exposeString("location"),
    dateTime: t.expose("dateTime", { type: "DateTime" }),
    isPublishedAt: t.expose("isPublishedAt", { type: "DateTime" }),
    opensForRegistrationsAt: t.expose("opensForRegistrationsAt", {
      type: "DateTime",
    }),
    closesForRegistrationsAt: t.expose("closesForRegistrationsAt", {
      type: "DateTime",
    }),
  }),
});

builder.queryFields((t) => ({
  allEvents: t.prismaField({
    type: ["Event"],
    smartSubscription: true,
    resolve: (query, _parent, _args, { events }) =>
      events.injectQueryArgs(query).findAll(),
  }),
  eventById: t.prismaField({
    type: "Event",
    smartSubscription: true,
    args: {
      eventId: t.arg({ type: "UUID" }),
    },
    resolve: (query, _parent, { eventId }, { events }) =>
      events.injectQueryArgs(query).findById(eventId),
  }),
}));

export const createEventInputSchema = z
  .object({
    title: z.string(),
    location: z.string(),
    dateTime: z.date(),
    isPublishedAt: z.date().optional(),
    opensForRegistrationsAt: z.date().optional(),
    closesForRegistrationsAt: z.date().optional(),
  })
  .refine((data) => isEventValid(defaultEventData(data)));

export const CreateEventInput = builder.inputType("CreateEventInput", {
  fields: (t) => ({
    title: t.string(),
    location: t.string(),
    dateTime: t.field({ type: "DateTime" }),
    isPublishedAt: t.field({ type: "DateTime", required: false }),
    opensForRegistrationsAt: t.field({ type: "DateTime", required: false }),
    closesForRegistrationsAt: t.field({ type: "DateTime", required: false }),
  }),
  validate: {
    schema: createEventInputSchema,
  },
});

builder.mutationFields((t) => ({
  createEvent: t.prismaField({
    type: "Event",
    args: {
      input: t.arg({ type: CreateEventInput }),
    },
    resolve: (query, _parent, { input }, { events }) =>
      events
        .injectQueryArgs(query)
        .create(defaultEventData(createEventInputSchema.parse(input))),
  }),
  editEvent: t.prismaField({
    type: "Event",
    args: {
      eventId: t.arg({ type: "UUID" }),
      input: t.arg({ type: CreateEventInput }),
    },
    resolve: (query, _parent, { eventId, input }, { events }) =>
      events
        .injectQueryArgs(query)
        .updateById(
          eventId,
          defaultEventData(createEventInputSchema.parse(input)),
        ),
  }),
}));
