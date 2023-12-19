import builder from "../builder";

builder.prismaObject("ContactInfo", {
  fields: (t) => ({
    email: t.expose("email", { type: "Email" }),
    firstName: t.exposeString("firstName"),
    lastName: t.exposeString("lastName"),
    firstNickname: t.exposeString("firstNickName", {
      nullable: true,
    }),
    lastNickName: t.exposeString("lastNickName", {
      nullable: true,
    }),
  }),
});
