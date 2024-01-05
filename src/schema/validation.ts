import { z } from "zod";
import {
  isEventOpeningBeforeClosing,
  defaultEventData,
  ERROR_CLOSING_BEFORE_OPENING,
  isEventStartingBeforeClosing,
  isEventValid,
} from "../model/events";

export const contactInfoInputSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  firstNickName: z.string().or(z.null()).optional().default(null),
  lastNickName: z.string().or(z.null()).optional().default(null),
});

export const personalInfoInputSchema = z.object({
  diet: z.string(),
  allergies: z.string().array(),
});

export const createEventInputSchema = z
  .object({
    title: z.string(),
    location: z.string(),
    dateTime: z.date(),
    isPublishedAt: z.date().optional(),
    opensForRegistrationsAt: z.date().optional(),
    closesForRegistrationsAt: z.date().optional(),
  })
  .refine((data) => isEventOpeningBeforeClosing(defaultEventData(data)), {
    message: ERROR_CLOSING_BEFORE_OPENING,
    path: ["closesForRegistrationsAt"],
  })
  .refine((data) => isEventStartingBeforeClosing(defaultEventData(data)), {
    message: "Event cannot start before closing for registration.",
    path: ["dateTime"],
  })
  .refine(
    (data) => isEventValid(defaultEventData(data)),
    "Event data is invalid.",
  );
