import { EventExtension } from "../../src/prisma/extensions/EventExtension";
import { RegistrationExtension } from "../../src/prisma/extensions/RegistrationExtension";
import { PrismaClient } from "@prisma/client";

/**
 * Exports the prisma client in a server-only remix module so that it does not leak into client browser or apply any side-effects multiple times.
 * @see https://remix.run/docs/en/main/guides/data-loading#databases
 */
const client = new PrismaClient()
  .$extends(EventExtension)
  .$extends(RegistrationExtension);

export { client };
