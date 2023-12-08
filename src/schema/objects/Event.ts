/**
 * @file Configures and exports the `Event` object type.
 */

import builder from "../builder.ts";
import {
  createEvent,
  findAllEvents,
  findEventById,
  updateEventById,
} from "../../model/events.ts";
import prisma, { extendWithQueryArgsBefore } from "../../prisma.ts";

builder.prismaObject("Event", {
  fields: (t) => ({
    id: t.exposeID("id"),
    title: t.exposeString("title"),
    dateTime: t.expose("dateTime", {
      type: "Date",
    }),
  }),
  subscribe(subscriptions, parent, _, info) {
    subscriptions.register(`${info.parentType.name}/Edit/${parent.id}`, {
      refetch: () => findEventById(prisma, parent.id),
    });
  },
});

builder.queryFields((t) => ({
  allEvents: t.prismaField({
    type: ["Event"],
    resolve: async (query) =>
      await findAllEvents(extendWithQueryArgsBefore(prisma, query)),
    smartSubscription: true,
    subscribe(subscriptions) {
      subscriptions.register(`Event/Create`);
    },
  }),
}));

builder.mutationFields((t) => ({
  editEvent: t.prismaFieldWithInput({
    type: "Event",
    input: {
      id: t.input.string({ required: true }),
      title: t.input.string(),
      dateTime: t.input.string(),
      location: t.input.string(),
    },
    resolve: async (query, _, args, ctx) => {
      const result = await updateEventById(
        extendWithQueryArgsBefore(prisma, query),
        args.input.id,
        args.input,
      );
      ctx.pubsub.publish(`Event/Edit/${args.input.id}`);
      return result;
    },
  }),
  createEvent: t.prismaFieldWithInput({
    type: "Event",
    input: {
      title: t.input.string({ required: true }),
      dateTime: t.input.string({ required: true }),
      location: t.input.string({ required: true }),
    },
    resolve: async (query, _, args, ctx) => {
      const result = await createEvent(
        extendWithQueryArgsBefore(prisma, query),
        args.input,
      );
      ctx.pubsub.publish(`Event/Create`);
      return result;
    },
  }),
}));
