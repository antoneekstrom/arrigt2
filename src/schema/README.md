# Schema

The schema directory and its files are related to the public interface of the API, and the types of the GraphQL schema.

## Directories

- `/builder.ts`
  - Creates the schema builder
- `/index.ts`
  - Exports the schema
- `/objects/*` 
  - Each file corresponds to an object type in the schema
  - Colocates queries, mutations and fields that return the given type