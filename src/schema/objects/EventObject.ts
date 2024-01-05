/**
 * @file Configures and exports the `Event` object type.
 */

import builder from "../builder.ts";
import {
  defaultEventData,
  hasEventClosed,
  hasEventOpened,
  isEventOpen,
} from "../../model/events.ts";
import { subscribeObjectType } from "../helpers.ts";
import { Event } from "@prisma/client";
import { createEventInputSchema } from "../validation.ts";
import { now } from "../../common/dateTime.ts";

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
      nullable: true,
    }),
    isOpen: t.field({
      type: "Boolean",
      resolve: (event) => isEventOpen(event),
    }),
    hasClosed: t.field({
      type: "Boolean",
      resolve: (event) => hasEventClosed(event),
    }),
    hasOpened: t.field({
      type: "Boolean",
      resolve: (event) => hasEventOpened(event),
    }),
  }),
});

builder.queryFields((t) => ({
  allEvents: t.prismaField({
    type: ["Event"],
    smartSubscription: false,
    resolve: (query, _parent, _args, { events }) =>
      events.injectQueryArgs(query).findAll(),
  }),
  eventById: t.prismaField({
    type: "Event",
    smartSubscription: false,
    args: {
      eventId: t.arg({ type: "UUID" }),
    },
    resolve: (query, _parent, { eventId }, { events }) =>
      events.injectQueryArgs(query).findById(eventId),
  }),
}));

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

export const EditEventInput = builder.inputType("EditEventInput", {
  fields: (t) => ({
    title: t.string({ required: false }),
    location: t.string({ required: false }),
    dateTime: t.field({ type: "DateTime", required: false }),
    isPublishedAt: t.field({ type: "DateTime", required: false }),
    opensForRegistrationsAt: t.field({ type: "DateTime", required: false }),
    closesForRegistrationsAt: t.field({ type: "DateTime", required: false }),
  }),
  // validate: {
  //   schema: createEventInputSchema,
  // },
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
      input: t.arg({ type: EditEventInput }),
    },
    resolve: (query, _parent, { eventId, input }, { events }) =>
      events
        .injectQueryArgs(query)
        .updateById(
          eventId,
          defaultEventData(createEventInputSchema.parse(input)),
        ),
  }),
  closeEvent: t.prismaField({
    type: "Event",
    args: {
      eventId: t.arg({ type: "UUID" }),
    },
    resolve: (query, _parent, { eventId }, { events }) =>
      events.injectQueryArgs(query).updateById(eventId, {
        closesForRegistrationsAt: now(),
      }),
  }),
  openEvent: t.prismaField({
    type: "Event",
    args: {
      eventId: t.arg({ type: "UUID" }),
    },
    resolve: (query, _parent, { eventId }, { events }) =>
      events.injectQueryArgs(query).updateById(eventId, {
        opensForRegistrationsAt: now(),
        closesForRegistrationsAt: null,
      }),
  }),
}));
