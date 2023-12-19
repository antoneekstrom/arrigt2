import { expect } from "vitest";
import { z } from "zod";
import prisma from "../src/prisma";

export const expectSchema = <T>(
  schema: z.ZodSchema<T>,
  obj: T,
  success: boolean,
) => expect(schema.safeParse(obj).success).toBe(success);

export const expectValid = <T>(schema: z.ZodSchema<T>, obj: T) =>
  expectSchema(schema, obj, true);

export const expectInvalid = <T>(schema: z.ZodSchema<T>, obj: T) =>
  expectSchema(schema, obj, false);

export async function resetDb() {
  console.log("Resetting database..");
  await prisma.$executeRawUnsafe(`
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
              EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END $$;
    `);
}
