/**
 * @file Configures and exports the `Event` object type.
 */

import builder from "../builder";
import { hasEventClosed, hasEventOpened } from "../../model/events";
import { canRegisterToEvent } from "../../model/registrations";
import prisma from "../../prisma";
import { EventExtension } from "../../prisma/extensions/EventExtension";
import * as Events from "../../model/events";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
} from "@prisma/client/runtime/library";
import { GraphQLError } from "graphql";

export const EventObjectType = builder.prismaObject("Event", {
  fields: (t) => ({
    id: t.expose("id", { type: "UUID" }),
    title: t.exposeString("title"),
    location: t.exposeString("location"),
    dateTime: t.expose("dateTime", { type: "DateTime" }),
    isPublishedAt: t.expose("isPublishedAt", {
      type: "DateTime",
      nullable: true,
    }),
    opensForRegistrationsAt: t.expose("opensForRegistrationsAt", {
      type: "DateTime",
    }),
    closesForRegistrationsAt: t.expose("closesForRegistrationsAt", {
      type: "DateTime",
      nullable: true,
    }),
    canRegisterTo: t.field({
      type: "Boolean",
      resolve: (event) => canRegisterToEvent(event),
    }),
    hasClosed: t.field({
      type: "Boolean",
      resolve: (event) => hasEventClosed(event),
    }),
    hasOpened: t.field({
      type: "Boolean",
      resolve: (event) => hasEventOpened(event),
    }),
    isDraft: t.field({
      type: "Boolean",
      resolve: (event) => Events.isEventDraft(event),
    }),
  }),
});

builder.queryFields((t) => ({
  allPublishedEvents: t.prismaField({
    type: ["Event"],
    smartSubscription: false,
    resolve: (query) =>
      prisma
        .$extends(EventExtension)
        .event.findMany({ ...query })
        .catch((err) => {
          if (err instanceof PrismaClientInitializationError) {
            return Promise.reject(new GraphQLError("Cannot reach database."));
          }
          return Promise.reject(err);
        })
        .then((events) =>
          events.filter((event) => !Events.isEventDraft(event)),
        ),
  }),
  allEvents: t.prismaField({
    type: ["Event"],
    smartSubscription: false,
    resolve: (query) =>
      prisma
        .$extends(EventExtension)
        .event.findMany({ ...query })
        .catch((err) => {
          if (err instanceof PrismaClientInitializationError) {
            return Promise.reject(new GraphQLError("Cannot reach database."));
          }
          return Promise.reject(err);
        }),
  }),
  eventById: t.prismaField({
    type: "Event",
    smartSubscription: false,
    args: {
      eventId: t.arg({ type: "UUID" }),
    },
    resolve: async (query, _parent, { eventId }) => {
      try {
        return await prisma.event.findUniqueOrThrow({
          ...query,
          where: { id: eventId },
        });
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === "P2025") {
            throw new GraphQLError(`Event with id ${eventId} not found.`);
          }
        }
        throw err;
      }
    },
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
});

builder.mutationFields((t) => ({
  createEvent: t.prismaField({
    type: "Event",
    args: {
      input: t.arg({ type: CreateEventInput }),
    },
    resolve: async (query, _parent, { input }) => {
      const client = prisma.$extends(EventExtension);
      try {
        return await client.event.create({
          ...query,
          data: Events.EventSchema.parse(input),
        });
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            return Promise.reject(
              new GraphQLError(
                `Event with title ${input.title} already exists.`,
              ),
            );
          }
        }
        return Promise.reject(err);
      }
    },
  }),
  editEvent: t.prismaField({
    type: "Event",
    args: {
      eventId: t.arg({ type: "UUID" }),
      input: t.arg({ type: EditEventInput }),
    },
    resolve: async (query, _parent, { eventId, input }) =>
      prisma
        .$extends(EventExtension)
        .event.edit(
          { ...query, id: eventId },
          Events.EventSchema.partial().parse(input),
        ),
  }),
  closeRegistrations: t.prismaField({
    type: "Event",
    args: {
      eventId: t.arg({ type: "UUID" }),
    },
    resolve: (query, _parent, { eventId }) =>
      prisma
        .$extends(EventExtension)
        .event.closeRegistrations({ ...query, id: eventId }),
  }),
  openRegistrations: t.prismaField({
    type: "Event",
    args: {
      eventId: t.arg({ type: "UUID" }),
    },
    resolve: (query, _parent, { eventId }) =>
      prisma
        .$extends(EventExtension)
        .event.openRegistrations({ ...query, id: eventId }),
  }),
}));
