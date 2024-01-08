/**
 * @file Configures and exports the `EmailRegistration` object type.
 */

import { EmailRegistration } from "@prisma/client";
import builder from "../builder.ts";
import { subscribeObjectType } from "../helpers.ts";
import { ContactInfoInput } from "./ContactInfoObject.ts";
import { EventObjectType } from "./EventObject.ts";
import { PersonalInfoInput } from "./PersonalInfoObject.ts";
import prisma from "../../prisma.ts";
import { RegistrationExtension } from "../../model/extensions/RegistrationExtension.ts";

export const EmailRegistrationObjectType = builder.prismaObject(
  "EmailRegistration",
  {
    subscribe: subscribeObjectType<EmailRegistration>(
      (registration) => registration.email,
      ({ eventId, email }) =>
        prisma.emailRegistration.findUniqueOrThrow({
          where: {
            email_eventId: {
              email,
              eventId,
            },
          },
        }),
    ),
    fields: (t) => ({
      event: t.relation("event"),
      contactInfo: t.relation("contactInfo"),
    }),
  },
);

builder.prismaObjectFields(EventObjectType, (t) => ({
  registrations: t.relation("emailRegistrations"),
  registrationCount: t.relationCount("emailRegistrations"),
  diets: t.stringList({
    select: {
      emailRegistrations: {
        select: {
          personalInfo: {
            select: {
              diet: true,
            },
          },
        },
      },
    },
    resolve: (parent) =>
      parent.emailRegistrations
        .map((r) => r?.personalInfo?.diet)
        .filter((value) => value),
  }),
  allergies: t.stringList({
    select: {
      emailRegistrations: {
        select: {
          personalInfo: {
            select: {
              allergies: true,
            },
          },
        },
      },
    },
    resolve: (parent) => [
      ...new Set(
        parent.emailRegistrations
          .flatMap((r) => r?.personalInfo?.allergies)
          .filter((value) => value),
      ).values(),
    ],
  }),
}));

builder.queryFields((t) => ({
  registrationsByEmail: t.prismaField({
    type: ["EmailRegistration"],
    smartSubscription: false,
    args: {
      email: t.arg({ type: "Email" }),
    },
    resolve: (query, _parent, { email }) =>
      prisma.$extends(RegistrationExtension).emailRegistration.findMany({
        ...query,
        where: {
          email,
        },
      }),
  }),
  registrationsByEventId: t.prismaField({
    type: ["EmailRegistration"],
    smartSubscription: false,
    args: {
      eventId: t.arg({ type: "UUID" }),
    },
    resolve: (query, _parent, { eventId }) =>
      prisma.$extends(RegistrationExtension).emailRegistration.findMany({
        ...query,
        where: {
          eventId,
        },
      }),
  }),
}));

const EmailRegistrationInput = builder.inputType("EmailRegistrationInput", {
  fields: (t) => ({
    contactInfo: t.field({ type: ContactInfoInput }),
    personalInfo: t.field({
      type: PersonalInfoInput,
      required: false,
    }),
  }),
});

builder.mutationFields((t) => ({
  registerByEmail: t.prismaField({
    type: "EmailRegistration",
    args: {
      eventId: t.arg({ type: "UUID" }),
      input: t.arg({ type: EmailRegistrationInput }),
    },
    resolve: async (query, _parent, { eventId, input }) =>
      prisma.$extends(RegistrationExtension).emailRegistration.registerTo({
        event: eventId,
        email: input.contactInfo.email,
        contactInfo: input.contactInfo,
        personalInfo: input.personalInfo ?? undefined,
      }),
  }),
}));
