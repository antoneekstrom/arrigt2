import { Event } from "@prisma/client";

export type EventData = Omit<Event, "id" | "createdAt">;

export const ERROR_CLOSING_BEFORE_OPENING =
  "Event cannot close for registration before opening for registration.";

export function defaultEventData(
  data: Partial<EventData> & Pick<EventData, "title" | "location" | "dateTime">,
): EventData {
  const now = new Date(Date.now());
  return {
    title: data.title,
    location: data.location,
    dateTime: data.dateTime,
    isPublishedAt: data.isPublishedAt ?? now,
    opensForRegistrationsAt: data.opensForRegistrationsAt ?? now,
    closesForRegistrationsAt: data.closesForRegistrationsAt ?? data.dateTime,
  };
}

export function isEventPublished(
  event: Pick<Event, "isPublishedAt">,
  now = new Date(Date.now()),
) {
  return now >= event.isPublishedAt;
}

export function hasEventOpened(
  event: Pick<Event, "opensForRegistrationsAt">,
  now = new Date(Date.now()),
) {
  return now >= event.opensForRegistrationsAt;
}

export function hasEventClosed(
  event: Pick<Event, "closesForRegistrationsAt">,
  now = new Date(Date.now()),
) {
  return !event.closesForRegistrationsAt
    ? false
    : now >= event.closesForRegistrationsAt;
}

export function isEventOpen(
  event: Pick<
    Event,
    "isPublishedAt" | "opensForRegistrationsAt" | "closesForRegistrationsAt"
  >,
  now = new Date(Date.now()),
) {
  return (
    isEventPublished(event, now) &&
    hasEventOpened(event, now) &&
    !hasEventClosed(event, now)
  );
}

export function isEventValid(event: EventData) {
  try {
    assertEventIsValid(event);
    return true;
  } catch {
    return false;
  }
}

export function assertEventIsValid(
  event: EventData,
): asserts event is EventData {
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
    throw new Error(ERROR_CLOSING_BEFORE_OPENING);
  }

  if (!isEventOpeningBeforeStarting(event)) {
    throw new Error("Event cannot start before opening for registration.");
  }

  if (!isEventStartingBeforeClosing(event)) {
    throw new Error("Event cannot close for registration before starting.");
  }
}

export function isEventPublishedBeforeOpening(
  event: Pick<Event, "opensForRegistrationsAt" | "isPublishedAt">,
) {
  return event.isPublishedAt <= event.opensForRegistrationsAt;
}

export function isEventPublishedBeforeClosing(
  event: Pick<Event, "isPublishedAt" | "closesForRegistrationsAt">,
) {
  return (
    !event.closesForRegistrationsAt ||
    event.isPublishedAt < event.closesForRegistrationsAt
  );
}

export function isEventPublishedBeforeStarting(
  event: Pick<Event, "isPublishedAt" | "dateTime">,
) {
  return event.isPublishedAt <= event.dateTime;
}

export function isEventOpeningBeforeClosing(
  event: Pick<Event, "closesForRegistrationsAt" | "opensForRegistrationsAt">,
) {
  return (
    !event.closesForRegistrationsAt ||
    event.closesForRegistrationsAt > event.opensForRegistrationsAt
  );
}

export function isEventOpeningBeforeStarting(
  event: Pick<Event, "opensForRegistrationsAt" | "dateTime">,
) {
  return event.opensForRegistrationsAt <= event.dateTime;
}

export function isEventStartingBeforeClosing(
  event: Pick<Event, "dateTime" | "closesForRegistrationsAt">,
) {
  return (
    !event.closesForRegistrationsAt ||
    event.dateTime <= event.closesForRegistrationsAt
  );
}
