import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export const ValidationErrorExtension = Prisma.defineExtension({
  query: {
    async $allOperations({ query, args }) {
      try {
        return await query(args);
      } catch (err) {
        if (err instanceof ZodError) {
          const validationError = fromZodError(err);
          return Promise.reject(
            new GraphQLError(validationError.message, {
              extensions: {
                details: validationError.details,
              },
            }),
          );
        }
        return Promise.reject(err);
      }
    },
  },
});
