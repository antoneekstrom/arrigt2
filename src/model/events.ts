import { Event } from "@prisma/client";
import { z } from "zod";

/**
 * Validates user input for event objects.
 */
export const EventInputSchema = z
  .object({
    title: z.string(),
    dateTime: z.date(),
    publishedAt: z.date().nullable().default(null),
    location: z.string().optional().nullable(),
    organizer: z.string().optional().nullable(),
  })
  .refine(isPublishedBeforeStarting, {
    message: "Event cannot start before being published.",
    path: ["dateTime"],
  });

export const DataAgreementInputSchema = z.object({
  deleteAt: z.date(),
  dataStored: z.string().array(),
  parties: z.string().array(),
  contactEmail: z.string().email(),
});

export function unpublish(event: z.input<typeof EventInputSchema>) {
  return EventInputSchema.parse({
    ...event,
    dateTime: null,
  });
}

export function publishAt(
  event: z.input<typeof EventInputSchema>,
  dateTime: Date,
) {
  return EventInputSchema.parse({
    ...event,
    dateTime,
  });
}

/**
 *
 * @returns true if a user should be able to sign up for the given event
 */
export function canRegisterTo(event: Event, now = new Date(Date.now())) {
  return isPublished(event, now);
}

/**
 *
 * @returns true if the event is considered a draft
 */
export function isDraft(event: Pick<Event, "publishedAt">) {
  return !event.publishedAt;
}

/**
 *
 * @returns true if the event is published and publicly available to users
 */
export function isPublished(
  event: Pick<Event, "publishedAt">,
  now = new Date(Date.now()),
) {
  return !event.publishedAt || now >= event.publishedAt;
}

/**
 * @returns true if the event is being published before the event happens
 */
export function isPublishedBeforeStarting(
  event: Pick<Event, "publishedAt" | "dateTime">,
) {
  return !event.publishedAt || event.publishedAt <= event.dateTime;
}
