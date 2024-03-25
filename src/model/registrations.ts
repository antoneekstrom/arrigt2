import { z } from "zod";
import { Prisma } from "@prisma/client";
import { canRegisterTo } from "./events";

export { AttendeeInputSchema, RegistrationsModel };

/**
 * Validates user input for attendee objects.
 */
const AttendeeInputSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  firstNickName: z.string().nullish(),
  lastNickName: z.string().nullish(),
});

const RegistrationsModel = Prisma.defineExtension({
  model: {
    registration: {
      async unregisterWithEmail(eventId: string, email: string) {
        const ctx = Prisma.getExtensionContext(this);
        return ctx.$parent.$transaction(async (client) => {
          // TODO test
          // preferences should also be deleted if there are any related to the registration
          // is deleted by `onDelete: Cascade` in `schema.prisma`
          return client.registration.delete({
            where: {
              email_eventId: {
                email,
                eventId,
              },
            },
          });
        });
      },
      async createWithEmail(
        eventId: string,
        attendee: z.input<typeof AttendeeInputSchema>,
      ) {
        const ctx = Prisma.getExtensionContext(this);
        attendee = AttendeeInputSchema.parse(attendee);

        return ctx.$parent.$transaction(async (client) => {
          const event = await client.event.findUniqueOrThrow({
            where: {
              id: eventId,
            },
          });

          // TODO test
          if (!canRegisterTo(event)) {
            throw new Error(
              `Unable to register to event ${eventId} with email ${attendee.email}.`,
            );
          }

          return client.registration.create({
            data: {
              Attendee: {
                // TODO test
                connectOrCreate: {
                  create: attendee,
                  where: {
                    email: attendee.email,
                  },
                },
              },
              Event: {
                connect: {
                  id: eventId,
                },
              },
            },
          });
        });
      },
    },
  },
});
