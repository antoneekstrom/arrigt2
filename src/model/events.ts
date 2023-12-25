import { Event } from "@prisma/client";

export type EventData = Omit<Event, "id" | "createdAt">;

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

export function isEventOpen(
  event: Pick<Event, "opensForRegistrationsAt">,
  now = new Date(Date.now()),
) {
  return now >= event.opensForRegistrationsAt;
}

export function isEventValid(event: EventData) {
  try {
    assertEventIsValid(event);
    return true;
  } catch {
    return false;
  }
}

export function assertEventIsValid(event: EventData): asserts event is Event {
  if (!eventIsPublishedBeforeOpening(event)) {
    throw new Error(
      "Event cannot open for registration before being published.",
    );
  }

  if (!eventIsPublishedBeforeClosing(event)) {
    throw new Error(
      "Event cannot close for registration before being published.",
    );
  }

  if (!eventIsPublishedBeforeStarting(event)) {
    throw new Error("Event cannot start before being published.");
  }

  if (!eventIsOpeningBeforeClosing(event)) {
    throw new Error(
      "Event cannot close for registration before opening for registration.",
    );
  }

  if (!eventIsOpeningBeforeStarting(event)) {
    throw new Error("Event cannot start before opening for registration.");
  }

  if (!eventIsStartingBeforeClosing(event)) {
    throw new Error("Event cannot close for registration before starting.");
  }
}

export function eventIsPublishedBeforeOpening(
  event: Pick<Event, "opensForRegistrationsAt" | "isPublishedAt">,
) {
  return event.isPublishedAt <= event.opensForRegistrationsAt;
}

export function eventIsPublishedBeforeClosing(
  event: Pick<Event, "isPublishedAt" | "closesForRegistrationsAt">,
) {
  return event.isPublishedAt < event.closesForRegistrationsAt;
}

export function eventIsPublishedBeforeStarting(
  event: Pick<Event, "isPublishedAt" | "dateTime">,
) {
  return event.isPublishedAt <= event.dateTime;
}

export function eventIsOpeningBeforeClosing(
  event: Pick<Event, "closesForRegistrationsAt" | "opensForRegistrationsAt">,
) {
  return event.closesForRegistrationsAt > event.opensForRegistrationsAt;
}

export function eventIsOpeningBeforeStarting(
  event: Pick<Event, "opensForRegistrationsAt" | "dateTime">,
) {
  return event.opensForRegistrationsAt <= event.dateTime;
}

export function eventIsStartingBeforeClosing(
  event: Pick<Event, "dateTime" | "closesForRegistrationsAt">,
) {
  return event.dateTime <= event.closesForRegistrationsAt;
}
