/**
 * @file Configures and exports the `ContactInfoObject` object type.
 */

import { ContactInfoSchema } from "../../model/registrations";
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

export const ContactInfoInput = builder.inputType("ContactInfoInput", {
  validate: {
    schema: ContactInfoSchema,
  },
  fields: (t) => ({
    email: t.field({ type: "Email" }),
    firstName: t.field({ type: "String" }),
    lastName: t.field({ type: "String" }),
    firstNickName: t.field({
      type: "String",
      required: false,
    }),
    lastNickName: t.field({
      type: "String",
      required: false,
    }),
  }),
});
