import { z } from "zod";

/**
 * Validates user input for attendee objects.
 */
export const AttendeeInputSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  firstNickName: z.string().nullish(),
  lastNickName: z.string().nullish(),
});
