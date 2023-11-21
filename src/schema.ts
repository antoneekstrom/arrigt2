import SchemaBuilder from "@pothos/core";

const builder = new SchemaBuilder({});

builder.queryType({
  fields: (t) => ({
    plupp: t.string({
      resolve: () => "apa snor",
    }),
  }),
});

export default builder.toSchema();
