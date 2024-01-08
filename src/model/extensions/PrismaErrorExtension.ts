import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { GraphQLError } from "graphql";

export const PrismaErrorExtension = Prisma.defineExtension({
  query: {
    async $allOperations({ query, args }) {
      try {
        return await query(args);
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
          return Promise.reject(new GraphQLError(err.message));
        }
        return Promise.reject(err);
      }
    },
  },
});
