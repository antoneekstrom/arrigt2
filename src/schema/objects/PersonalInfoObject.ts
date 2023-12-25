/**
 * @file Configures and exports the `PersonalInfoObject` object type.
 */

import { z } from "zod";
import builder from "../builder";

builder.prismaObject("PersonalInfo", {
  fields: (t) => ({
    diet: t.exposeString("diet"),
    allergies: t.exposeStringList("allergies"),
  }),
});

export const personalInfoInputSchema = z.object({
  diet: z.string(),
  allergies: z.string().array(),
});

export const PersonalInfoInput = builder.inputType("PersonalInfoInput", {
  fields: (t) => ({
    diet: t.field({ type: "String" }),
    allergies: t.field({ type: ["String"] }),
  }),
});
