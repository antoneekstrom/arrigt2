import builder from "../builder";

builder.prismaObject("EmailRegistration", {
  fields: (t) => ({
    event: t.relation("event"),
    personalInfo: t.relation("personalInfo", {
      nullable: true,
    }),
    contactInfo: t.relation("contactInfo"),
    email: t.expose("email", { type: "Email" }),
    createdAt: t.expose("createdAt", {
      type: "DateTime",
    }),
  }),
});

builder.queryFields((t) => ({
  registrationsByEmail: t.prismaFieldWithInput({
    type: ["EmailRegistration"],
    input: {
      email: t.input.field({
        type: "Email",
        required: true,
      }),
    },
    resolve: (query, _parent, { input: { email } }, { registrations }) =>
      registrations.injectQueryArgs(query).findByEmail(email),
  }),
}));

builder.mutationFields((t) => ({
  registerToEventByEmail: t.prismaFieldWithInput({
    type: "EmailRegistration",
    input: {
      eventId: t.input.string({
        required: true,
      }),
      email: t.input.field({
        type: "Email",
        required: true,
      }),
      firstName: t.input.string({
        required: true,
      }),
      lastName: t.input.string({
        required: true,
      }),
    },
    resolve: async (
      query,
      _parent,
      { input: { eventId, email, firstName, lastName } },
      { registrations },
    ) =>
      await registrations.injectQueryArgs(query).createForEventById(eventId, {
        email,
        firstName,
        lastName,
        firstNickName: null,
        lastNickName: null,
      }),
  }),
}));
