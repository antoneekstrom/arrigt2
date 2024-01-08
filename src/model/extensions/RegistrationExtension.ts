import { Prisma } from "@prisma/client";
import * as registrations from "../registrations";
import type { EmailRegistrationSchema } from "../registrations";

export const RegistrationExtension = Prisma.defineExtension({
  model: {
    emailRegistration: {
      async registerTo(data: EmailRegistrationSchema) {
        const ctx = Prisma.getExtensionContext<typeof this>(this);

        return ctx.$parent.$transaction(async (prisma) => {
          const event = await prisma.event.findUniqueOrThrow({
            where: {
              id: data.event,
            },
          });

          if (!registrations.canRegisterToEvent(event)) {
            throw new Error("Cannot register to event");
          }

          return prisma.emailRegistration.create({
            data: {
              personalInfo: {
                create: data.personalInfo,
              },
              contactInfo: {
                // Reuse the same contact info if the email already exists
                connectOrCreate: {
                  create: data.contactInfo,
                  where: {
                    email: data.contactInfo.email,
                  },
                },
              },
              event: {
                connect: {
                  id: data.event,
                },
              },
            },
          });
        });
      },
      async exists(
        where: Prisma.Args<
          Prisma.EmailRegistrationDelegate,
          "findUnique"
        >["where"],
      ) {
        const ctx = Prisma.getExtensionContext(this);
        const result = await ctx.findUnique({
          where,
        });
        return result !== null;
      },
    },
  },
});
