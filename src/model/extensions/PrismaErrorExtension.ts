import { Prisma } from "@prisma/client";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { GraphQLError } from "graphql";

export const PrismaErrorExtension = Prisma.defineExtension({
  query: {
    async $allOperations({ query, args }) {
      try {
        return await query(args);
      } catch (err) {
        if (err instanceof PrismaClientInitializationError) {
          return Promise.reject(new GraphQLError("Cannot reach database."));
        }
        return Promise.reject(err);
      }
    },
  },
});
