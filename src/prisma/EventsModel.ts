import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  canRegisterTo,
  isPublished,
  EventInputSchema,
  DataAgreementInputSchema,
  isDraft,
  publishAt,
  unpublish,
} from "../model/events";

function agreementFromEvent(event: z.input<typeof EventInputSchema>) {
  return {
    contactEmail: "styrit@chalmers.it",
    dataStored: ["email", "name"],
    deleteAt: event.dateTime,
  };
}

export const EventsModel = Prisma.defineExtension({
  result: {
    event: {
      canRegisterTo: {
        needs: {
          publishedAt: true,
        },
        compute: canRegisterTo,
      },
      isDraft: {
        needs: {
          publishedAt: true,
        },
        compute: isDraft,
      },
      isPublished: {
        needs: {
          publishedAt: true,
        },
        compute: (event) => isPublished(event, new Date(Date.now())),
      },
    },
  },
  model: {
    event: {
      // TODO test
      async publish(eventId: string, dateTime: Date) {
        const ctx = Prisma.getExtensionContext(this); // TODO abstraction
        return ctx.$parent.$transaction(async (client) => {
          const event = await client.event.findUniqueOrThrow({
            where: { id: eventId },
          });
          return client.event.update({
            where: {
              id: eventId,
            },
            data: publishAt(event, dateTime), // TODO abstraction
          });
        });
      },
      // TODO test
      async unpublish(eventId: string) {
        const ctx = Prisma.getExtensionContext(this);
        return ctx.$parent.$transaction(async (client) => {
          const event = await client.event.findUniqueOrThrow({
            where: { id: eventId },
          });
          return client.event.update({
            where: {
              id: eventId,
            },
            data: unpublish(event), // TODO abstraction
          });
        });
      },
      /**
       * Validates the input and creates record for an event.
       * @param event the event to create
       * @param agreement the agreement to use
       */
      async createWithAgreement(
        event: z.input<typeof EventInputSchema>,
        agreement?: z.input<typeof DataAgreementInputSchema>,
      ) {
        const ctx = Prisma.getExtensionContext(this);
        event = EventInputSchema.parse(event);

        return await ctx.create({
          data: {
            ...event,
            DataAgreement: {
              connectOrCreate: {
                where: {
                  id: 0,
                },
                create: agreement ?? agreementFromEvent(event),
              },
            },
          },
        });
      },
    },
  },
  query: {
    event: {
      async create({ args, query }) {
        const data = { ...args.data, ...EventInputSchema.parse(args.data) }; // TODO abstraction
        return await query({ ...args, data });
      },
      async update({ args, query }) {
        const data = { ...args.data, ...EventInputSchema.parse(args.data) }; // TODO abstraction
        data.updatedAt = new Date(Date.now());
        return await query({ ...args, data });
      },
    },
  },
});
