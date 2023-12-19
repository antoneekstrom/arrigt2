import builder from "../builder";

builder.prismaObject("PersonalInfo", {
  fields: (t) => ({
    id: t.exposeString("id"),
    diet: t.exposeString("diet"),
    allergies: t.exposeStringList("allergies"),
  }),
});
