import { Event, Prisma } from "@prisma/client";
import { z } from "zod";

export {
  EventsModel,
  EventInputSchema,
  canRegisterTo,
  isPublishedBeforeStarting,
  isPublished,
};

/**
 * Validates user input for event objects.
 */
const EventInputSchema = z
  .object({
    title: z.string(),
    dateTime: z.date(),
    publishedAt: z.date().nullable(),
  })
  .refine(isPublishedBeforeStarting, {
    message: "Event cannot start before being published.",
    path: ["dateTime"],
  });

const DataAgreementInputSchema = z.object({
  deleteAt: z.date(),
  dataStored: z.string().array(),
  parties: z.string().array(),
  contactEmail: z.string().email(),
});

const EventsModel = Prisma.defineExtension({
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
        agreement = DataAgreementInputSchema.parse(agreement);

        return await ctx.create({
          data: {
            ...event,
            DataAgreement: {
              create: agreement,
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

function unpublish(event: z.input<typeof EventInputSchema>) {
  return EventInputSchema.parse({
    ...event,
    dateTime: null,
  });
}

function publishAt(event: z.input<typeof EventInputSchema>, dateTime: Date) {
  return EventInputSchema.parse({
    ...event,
    dateTime,
  });
}

/**
 *
 * @returns true if a user should be able to sign up for the given event
 */
function canRegisterTo(event: Event, now = new Date(Date.now())) {
  return isPublished(event, now);
}

/**
 *
 * @returns true if the event is considered a draft
 */
function isDraft(event: Pick<Event, "publishedAt">) {
  return !event.publishedAt;
}

/**
 *
 * @returns true if the event is published and publicly available to users
 */
function isPublished(
  event: Pick<Event, "publishedAt">,
  now = new Date(Date.now()),
) {
  return !event.publishedAt || now >= event.publishedAt;
}

/**
 * @returns true if the event is being published before the event happens
 */
function isPublishedBeforeStarting(
  event: Pick<Event, "publishedAt" | "dateTime">,
) {
  return !event.publishedAt || event.publishedAt <= event.dateTime;
}
