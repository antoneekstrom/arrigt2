import { now } from "../common/dateTime";
import { z } from "zod";

export const EventSchema = z.object({
  title: z.string(),
  location: z.string().min(5),
  dateTime: z.coerce.date(),
  isPublishedAt: z.coerce.date().default(now()).nullable(),
  opensForRegistrationsAt: z.coerce.date().default(now()),
  closesForRegistrationsAt: z.coerce.date().optional().nullable(),
});

export const EventSchemaWithConstraints = EventSchema.required()
  .refine(isEventOpeningBeforeClosing, {
    message: "Event cannot close for registration before opening.",
    path: ["closesForRegistrationsAt"],
  })
  .refine(isEventOpeningBeforeStarting, {
    message: "Event cannot start before opening for registration.",
    path: ["dateTime"],
  })
  .refine(isEventPublishedBeforeClosing, {
    message: "Event cannot close for registration before being published.",
    path: ["closesForRegistrationsAt"],
  })
  .refine(isEventPublishedBeforeOpening, {
    message: "Event cannot open for registration before being published.",
    path: ["opensForRegistrationsAt"],
  })
  .refine(isEventPublishedBeforeStarting, {
    message: "Event cannot start before being published.",
    path: ["dateTime"],
  })
  .refine(isEventClosingBeforeStarting, {
    message: "Event cannot close for registration before starting.",
    path: ["closesForRegistrationsAt"],
  });

export function isEventDraft(
  event: Pick<z.output<typeof EventSchema>, "isPublishedAt">,
) {
  return !event.isPublishedAt;
}

export function hasEventBeenPublished(
  event: Pick<z.output<typeof EventSchema>, "isPublishedAt">,
  now = new Date(Date.now()),
) {
  return !event.isPublishedAt || now >= event.isPublishedAt;
}

export function hasEventOpened(
  event: Pick<z.output<typeof EventSchema>, "opensForRegistrationsAt">,
  now = new Date(Date.now()),
) {
  return now >= event.opensForRegistrationsAt;
}

export function hasEventClosed(
  event: Pick<z.output<typeof EventSchema>, "closesForRegistrationsAt">,
  now = new Date(Date.now()),
) {
  return !event.closesForRegistrationsAt
    ? false
    : now >= event.closesForRegistrationsAt;
}

export function isEventPublishedBeforeOpening(
  event: Pick<
    z.output<typeof EventSchema>,
    "opensForRegistrationsAt" | "isPublishedAt"
  >,
) {
  return (
    !event.isPublishedAt || event.isPublishedAt <= event.opensForRegistrationsAt
  );
}

export function isEventPublishedBeforeClosing(
  event: Pick<
    z.output<typeof EventSchema>,
    "isPublishedAt" | "closesForRegistrationsAt"
  >,
) {
  return (
    !event.isPublishedAt ||
    !event.closesForRegistrationsAt ||
    event.isPublishedAt < event.closesForRegistrationsAt
  );
}

export function isEventPublishedBeforeStarting(
  event: Pick<z.output<typeof EventSchema>, "isPublishedAt" | "dateTime">,
) {
  return !event.isPublishedAt || event.isPublishedAt <= event.dateTime;
}

export function isEventOpeningBeforeClosing(
  event: Pick<
    z.output<typeof EventSchema>,
    "closesForRegistrationsAt" | "opensForRegistrationsAt"
  >,
) {
  return (
    !event.closesForRegistrationsAt ||
    event.closesForRegistrationsAt > event.opensForRegistrationsAt
  );
}

export function isEventOpeningBeforeStarting(
  event: Pick<
    z.output<typeof EventSchema>,
    "opensForRegistrationsAt" | "dateTime"
  >,
) {
  return event.opensForRegistrationsAt <= event.dateTime;
}

export function isEventClosingBeforeStarting(
  event: Pick<
    z.output<typeof EventSchema>,
    "dateTime" | "closesForRegistrationsAt"
  >,
) {
  return (
    !event.closesForRegistrationsAt ||
    event.closesForRegistrationsAt <= event.dateTime
  );
}
