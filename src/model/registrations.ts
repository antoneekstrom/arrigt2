import { z } from "zod";
import {
  EventSchema,
  hasEventBeenPublished,
  hasEventOpened,
  hasEventClosed,
} from "./events";
import { now } from "../common/dateTime";

export type ContactInfoSchema = Required<z.infer<typeof ContactInfoSchema>>;

export type PersonalInfoSchema = Required<z.infer<typeof PersonalInfoSchema>>;

export type EmailRegistrationSchema = z.infer<typeof EmailRegistrationSchema>;

export const ContactInfoSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  firstNickName: z.string().nullish(),
  lastNickName: z.string().nullish(),
});

export const PersonalInfoSchema = z.object({
  diet: z.string(),
  allergies: z.string().array(),
});

export const EmailRegistrationSchema = z.object({
  email: z.string().email(),
  event: z.string().uuid(),
  contactInfo: ContactInfoSchema,
  personalInfo: PersonalInfoSchema.optional(),
});

export function closeRegistrations() {
  return {
    closesForRegistrationsAt: now(),
  };
}

export function openRegistrations() {
  return {
    opensForRegistrationsAt: now(),
    closesForRegistrationsAt: null,
  };
}

export function canRegisterToEvent(
  event: Pick<
    EventSchema,
    "isPublishedAt" | "opensForRegistrationsAt" | "closesForRegistrationsAt"
  >,
  now = new Date(Date.now()),
) {
  return (
    hasEventBeenPublished(event, now) &&
    hasEventOpened(event, now) &&
    !hasEventClosed(event, now)
  );
}
