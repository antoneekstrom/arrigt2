import { PrismaClient } from "@prisma/client";
import { EventsModel } from "../../src/model/events";
import { RegistrationsModel } from "../../src/model/registrations";

/**
 * Exports the prisma client in a server-only remix module so that it does not leak into client browser or apply any side-effects multiple times.
 * @see https://remix.run/docs/en/main/guides/data-loading#databases
 */
const client = new PrismaClient()
  .$extends(EventsModel)
  .$extends(RegistrationsModel);

export { client };
