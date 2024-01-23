/**
 * @file Configures and exports the prisma client.
 */

import { PrismaClient } from "@prisma/client";
import {
  DefaultArgs,
  PrismaClientOptions,
} from "@prisma/client/runtime/library";
import { ValidationErrorExtension } from "./model/extensions/ValidationErrorExtension";
import { PrismaErrorExtension } from "./model/extensions/PrismaErrorExtension";

/**
 * Can be either a PrismaClient or a PrismaClient with extensions.
 */
export type AnyPrismaClient = PrismaClient<
  PrismaClientOptions,
  unknown,
  DefaultArgs
>;

/**
 * Prisma client singleton instance.
 */
const prisma = new PrismaClient()
  .$extends(ValidationErrorExtension)
  .$extends(PrismaErrorExtension);

export default prisma;
