/**
 * @file Configures and exports the `Event` object type.
 */

import builder from "./builder.ts";
import prisma from "../prisma.ts";

builder.prismaObject("Event", {
  fields: (t) => ({
    id: t.exposeID("id"),
    title: t.exposeString("title"),
    dateTime: t.field({
      type: "String",
      resolve: async (self) => {
        const { dateTime } = await prisma.event.findUniqueOrThrow({
          where: {
            id: self.id,
          },
          select: {
            dateTime: true,
          },
        });
        return dateTime.toISOString();
      },
    }),
  }),
  subscribe(subscriptions, parent, context, info) {
    subscriptions.register(`${info.parentType.name}/Edit/${parent.id}`, {
      refetch: () =>
        prisma.event.findUniqueOrThrow({
          where: {
            id: parent.id,
          },
        }),
    });
  },
});

builder.queryFields((t) => ({
  allEvents: t.prismaField({
    type: ["Event"],
    resolve: async (query) =>
      prisma.event.findMany({
        ...query,
      }),
    smartSubscription: true,
    subscribe(subscriptions, parent, args, context, info) {
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
    resolve: async (query, parent, args, ctx, info) => {
      const result = await prisma.event.update({
        ...query,
        where: {
          id: args.input.id,
        },
        data: {
          title: args.input.title === null ? undefined : args.input.title,
          dateTime:
            args.input.dateTime === null ? undefined : args.input.dateTime,
          location:
            args.input.location === null ? undefined : args.input.location,
        },
      });
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
    resolve: async (query, parent, args, ctx, info) => {
      const result = await prisma.event.create({
        ...query,
        data: {
          title: args.input.title,
          dateTime: args.input.dateTime,
          location: args.input.location,
        },
      });
      ctx.pubsub.publish(`Event/Create`);
      return {
        id: result.id,
        dateTime: result.dateTime,
        location: result.location,
        title: result.title,
      };
    },
  }),
}));
