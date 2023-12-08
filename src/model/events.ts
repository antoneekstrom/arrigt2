import type { Prisma } from "@prisma/client";
import { AnyPrismaClient } from "../prisma";

type NullableProps<T> = { [P in keyof T]?: T[P] | undefined | null };

type NonNullableProps<T> = { [P in keyof T]: Exclude<T[P], null> };

/**
 * Returns a copy of the given object without any properties that are null.
 * @param obj object to copy
 * @returns object without null properties
 */
function omitNullFields<T>(obj: NullableProps<T>): NonNullableProps<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== null),
  ) as NonNullableProps<T>;
}

/**
 * Returns all events.
 * @param prisma the prisma client
 * @returns all events
 */
export function findAllEvents(prisma: AnyPrismaClient) {
  return prisma.event.findMany();
}

/**
 * Returns the event with the given id.
 * Throws if there is no unique event with the given id.
 * @param prisma prisma client
 * @param id id of the event
 * @returns event
 */
export function findEventById(prisma: AnyPrismaClient, id: string) {
  return prisma.event.findUniqueOrThrow({
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
export function updateEventById(
  prisma: AnyPrismaClient,
  id: string,
  data: NullableProps<Prisma.EventUpdateInput>,
) {
  return prisma.event.update({
    where: {
      id,
    },
    data: omitNullFields(data),
  });
}

/**
 * Creates a new event with the given data and a random id.
 * @param prisma prisma client
 * @param event event data
 * @returns created event
 */
export function createEvent(
  prisma: AnyPrismaClient,
  event: Prisma.EventCreateInput,
) {
  return prisma.event.create({
    data: event,
  });
}
