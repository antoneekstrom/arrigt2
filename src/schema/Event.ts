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
});

builder.queryFields((t) => ({
  allEvents: t.prismaField({
    type: ["Event"],
    resolve: async (query) =>
      prisma.event.findMany({
        ...query,
      }),
    smartSubscription: true,
    subscribe: (subscriptions) => {
      subscriptions.register("event:create");
      subscriptions.register("event:edit");
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
    resolve: (query, parent, args, ctx) => {
      ctx.pubsub.publish("event:edit");
      return prisma.event.update({
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
    },
  }),
  createEvent: t.prismaFieldWithInput({
    type: "Event",
    input: {
      title: t.input.string({ required: true }),
      dateTime: t.input.string({ required: true }),
      location: t.input.string({ required: true }),
    },
    resolve: (query, parent, args, ctx) => {
      ctx.pubsub.publish("event:create");
      return prisma.event.create({
        ...query,
        data: {
          title: args.input.title,
          dateTime: args.input.dateTime,
          location: args.input.location,
        },
      });
    },
  }),
}));
