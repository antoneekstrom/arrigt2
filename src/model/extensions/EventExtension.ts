import type { EventSchema } from "../events";
import { Prisma } from "@prisma/client";
import { Event } from "@prisma/client";
import * as Events from "../events";
import * as registrations from "../registrations";
import { z } from "zod";

export const EventExtension = Prisma.defineExtension({
  result: {
    event: {
      canRegisterToEvent: {
        needs: {
          closesForRegistrationsAt: true,
          opensForRegistrationsAt: true,
          isPublishedAt: true,
        },
        compute: registrations.canRegisterToEvent,
      },
      isDraft: {
        needs: {
          isPublishedAt: true,
        },
        compute: Events.isEventDraft,
      },
      hasOpened: {
        needs: {
          opensForRegistrationsAt: true,
        },
        compute: Events.hasEventOpened,
      },
      hasClosed: {
        needs: {
          closesForRegistrationsAt: true,
        },
        compute: Events.hasEventClosed,
      },
    },
  },
  model: {
    event: {
      edit(
        where: Prisma.Args<Prisma.EventDelegate, "update">["where"],
        data: Partial<z.output<typeof EventSchema>>,
      ): Promise<Event> {
        const ctx = Prisma.getExtensionContext(this);
        return ctx.$parent.$transaction(async (prisma) => {
          const result = await prisma.event.update({
            where,
            data,
          });
          Events.EventSchemaWithConstraints.parse(result);
          return result;
        });
      },
      closeRegistrations(
        where: Prisma.Args<Prisma.EventDelegate, "update">["where"],
      ): Promise<Event> {
        const ctx = Prisma.getExtensionContext(this);
        return ctx.$parent.$transaction(async (prisma) => {
          const event = await prisma.event.findUniqueOrThrow({ where });
          const parsed = Events.EventSchemaWithConstraints.parse(event);
          if (!registrations.canRegisterToEvent(parsed)) {
            return event;
          }
          return ctx.edit(where, registrations.closeRegistrations());
        });
      },
      openRegistrations(
        where: Prisma.Args<Prisma.EventDelegate, "update">["where"],
      ): Promise<Event> {
        const ctx = Prisma.getExtensionContext(this);
        return ctx.edit(where, registrations.openRegistrations());
      },
    },
  },
  query: {
    event: {
      async create({ args, query }) {
        const parsed = Events.EventSchemaWithConstraints.parse(args.data);
        return await query({ ...args, data: parsed });
      },
    },
  },
});
