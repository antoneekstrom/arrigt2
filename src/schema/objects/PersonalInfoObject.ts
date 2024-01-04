/**
 * @file Configures and exports the `PersonalInfoObject` object type.
 */

import builder from "../builder";

builder.prismaObject("PersonalInfo", {
  fields: (t) => ({
    diet: t.exposeString("diet"),
    allergies: t.exposeStringList("allergies"),
  }),
});

export const PersonalInfoInput = builder.inputType("PersonalInfoInput", {
  fields: (t) => ({
    diet: t.field({ type: "String" }),
    allergies: t.field({ type: ["String"] }),
  }),
});
