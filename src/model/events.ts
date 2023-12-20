import { z } from "zod";
import { Prisma } from "@prisma/client";
import { PrismaDelegate } from "../prisma";
import { inOneWeek, now } from "../common/dateTime";
import { Event } from "@prisma/client";

export type EventSchema = z.infer<typeof eventSchema>;

export const EVENT_TITLE_MIN_LENGTH = 3;
export const EVENT_TITLE_MAX_LENGTH = 64;
export const EVENT_LOCATION_MIN_LENGTH = 3;
export const EVENT_LOCATION_MAX_LENGTH = 32;

export const eventSchemaRequired = z.object({
  title: z.string().min(EVENT_TITLE_MIN_LENGTH).max(EVENT_TITLE_MAX_LENGTH),
  location: z
    .string()
    .min(EVENT_LOCATION_MIN_LENGTH)
    .max(EVENT_LOCATION_MAX_LENGTH),
  dateTime: z.date(),
});

export const eventSchemaOptional = z.object({
  isPublishedAt: z.date(),
  opensForRegistrationsAt: z.date(),
  closesForRegistrationsAt: z.date(),
});

export const eventSchemaMeta = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
});

export const eventSchema = eventSchemaMeta
  .merge(eventSchemaRequired)
  .merge(eventSchemaOptional)
  .refine(
    eventOpensBeforeClosing,
    "Event cannot close for registration before opening.",
  )
  .refine(
    eventIsPublishedBeforeOpening,
    "Event cannot open or close for registration before being published.",
  )
  .refine(
    eventStartsAfterClosing,
    "Event cannot take place before being published, or before opening or closing for registration.",
  );

export class Events extends PrismaDelegate {
  /**
   * Returns all events.
   * @param prisma the prisma client
   * @returns all events
   */
  findAll() {
    return this.prisma.event.findMany();
  }

  /**
   * Returns the event with the given id.
   * Throws if there is no unique event with the given id.
   * @param prisma prisma client
   * @param id id of the event
   * @returns event
   */
  findById(id: string) {
    return this.prisma.event.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  /**
   * Updates the event with the given id.
   * @param prisma prisma client
   * @param id id of the event
   * @param data new data to apply
   * @returns updated event
   */
  updateById(id: string, data: Prisma.EventUpdateInput) {
    return this.prisma.event.update({
      where: {
        id,
      },
      data,
    });
  }

  /**
   * Creates a new event with the given data and a random id.
   * @param prisma prisma client
   * @param data event data
   * @returns created event
   */
  create(data: Prisma.EventCreateInput) {
    return this.prisma.event.create({
      data,
    });
  }
}

/**
 *
 * @param title
 * @param location
 * @param dateTime
 * @returns
 */
export function createEventData(
  title: string,
  location: string,
  dateTime: Date,
  isPublishedAt = dateTime,
  opensForRegistrationsAt = dateTime,
  closesForRegistrationsAt = inOneWeek(opensForRegistrationsAt),
): EventSchema {
  return {
    title,
    location,
    dateTime,
    createdAt: now(),
    isPublishedAt,
    opensForRegistrationsAt,
    closesForRegistrationsAt,
  };
}

/**
 *
 * @param event
 * @returns
 */
export function eventOpensBeforeClosing(
  event: Pick<Event, "closesForRegistrationsAt" | "opensForRegistrationsAt">,
) {
  return event.closesForRegistrationsAt > event.opensForRegistrationsAt;
}

/**
 *
 * @param event
 * @returns
 */
export function eventIsPublishedBeforeOpening(
  event: Pick<
    Event,
    "closesForRegistrationsAt" | "opensForRegistrationsAt" | "isPublishedAt"
  >,
) {
  return (
    event.isPublishedAt <= event.opensForRegistrationsAt &&
    event.isPublishedAt < event.closesForRegistrationsAt
  );
}

/**
 *
 * @param event
 * @returns
 */
export function eventStartsAfterClosing(
  event: Pick<
    Event,
    | "dateTime"
    | "isPublishedAt"
    | "closesForRegistrationsAt"
    | "opensForRegistrationsAt"
  >,
) {
  return (
    event.dateTime >= event.isPublishedAt &&
    event.dateTime >= event.opensForRegistrationsAt &&
    event.dateTime <= event.closesForRegistrationsAt
  );
}

/**
 *
 * @param event
 * @returns
 */
export function isEventOpenForRegistering(
  event: Pick<
    Event,
    "isPublishedAt" | "closesForRegistrationsAt" | "opensForRegistrationsAt"
  >,
  now = new Date(Date.now()),
) {
  if (now < event.isPublishedAt) {
    return false;
  }

  if (now < event.opensForRegistrationsAt) {
    return false;
  }

  if (now >= event.closesForRegistrationsAt) {
    return false;
  }

  return true;
}
