/**
 * @file Configures and exports the prisma client.
 */

import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton instance.
 */
const prisma = new PrismaClient();

export default prisma;
