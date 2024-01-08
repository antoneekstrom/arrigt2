import { now } from "../common/dateTime";
import { z } from "zod";

export type EventSchema = Required<z.infer<typeof EventSchema>>;

export const EventSchema = z.object({
  title: z.string(),
  location: z.string(),
  dateTime: z.coerce.date(),
  isPublishedAt: z.coerce.date().default(now()).optional(),
  opensForRegistrationsAt: z.coerce.date().default(now()).optional(),
  closesForRegistrationsAt: z.coerce.date().optional().nullable(),
});

export const EventSchemaWithConstraints = EventSchema.required()
  .refine(
    isEventOpeningBeforeClosing,
    "Event cannot close for registration before opening.",
  )
  .refine(
    isEventOpeningBeforeStarting,
    "Event cannot start before opening for registration.",
  )
  .refine(
    isEventPublishedBeforeClosing,
    "Event cannot close for registration before being published.",
  )
  .refine(
    isEventPublishedBeforeOpening,
    "Event cannot open for registration before being published.",
  )
  .refine(
    isEventPublishedBeforeStarting,
    "Event cannot start before being published.",
  )
  .refine(
    isEventClosingBeforeStarting,
    "Event cannot close for registration before starting.",
  );

export function hasEventBeenPublished(
  event: Pick<EventSchema, "isPublishedAt">,
  now = new Date(Date.now()),
) {
  return now >= event.isPublishedAt;
}

export function hasEventOpened(
  event: Pick<EventSchema, "opensForRegistrationsAt">,
  now = new Date(Date.now()),
) {
  return now >= event.opensForRegistrationsAt;
}

export function hasEventClosed(
  event: Pick<EventSchema, "closesForRegistrationsAt">,
  now = new Date(Date.now()),
) {
  return !event.closesForRegistrationsAt
    ? false
    : now >= event.closesForRegistrationsAt;
}

export function assertEventIsValid(
  event: EventSchema,
): asserts event is EventSchema {
  if (!isEventPublishedBeforeOpening(event)) {
    throw new Error(
      "Event cannot open for registration before being published.",
    );
  }

  if (!isEventPublishedBeforeClosing(event)) {
    throw new Error(
      "Event cannot close for registration before being published.",
    );
  }

  if (!isEventPublishedBeforeStarting(event)) {
    throw new Error("Event cannot start before being published.");
  }

  if (!isEventOpeningBeforeClosing(event)) {
    throw new Error("Event cannot close for registration before opening.");
  }

  if (!isEventOpeningBeforeStarting(event)) {
    throw new Error("Event cannot start before opening for registration.");
  }

  if (!isEventClosingBeforeStarting(event)) {
    throw new Error("Event cannot close for registration before starting.");
  }
}

export function isEventPublishedBeforeOpening(
  event: Pick<EventSchema, "opensForRegistrationsAt" | "isPublishedAt">,
) {
  return event.isPublishedAt <= event.opensForRegistrationsAt;
}

export function isEventPublishedBeforeClosing(
  event: Pick<EventSchema, "isPublishedAt" | "closesForRegistrationsAt">,
) {
  return (
    !event.closesForRegistrationsAt ||
    event.isPublishedAt < event.closesForRegistrationsAt
  );
}

export function isEventPublishedBeforeStarting(
  event: Pick<EventSchema, "isPublishedAt" | "dateTime">,
) {
  return event.isPublishedAt <= event.dateTime;
}

export function isEventOpeningBeforeClosing(
  event: Pick<
    EventSchema,
    "closesForRegistrationsAt" | "opensForRegistrationsAt"
  >,
) {
  return (
    !event.closesForRegistrationsAt ||
    event.closesForRegistrationsAt > event.opensForRegistrationsAt
  );
}

export function isEventOpeningBeforeStarting(
  event: Pick<EventSchema, "opensForRegistrationsAt" | "dateTime">,
) {
  return event.opensForRegistrationsAt <= event.dateTime;
}

export function isEventClosingBeforeStarting(
  event: Pick<EventSchema, "dateTime" | "closesForRegistrationsAt">,
) {
  return (
    !event.closesForRegistrationsAt ||
    event.closesForRegistrationsAt <= event.dateTime
  );
}
