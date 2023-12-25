# Model

The model directory and its files are related to business logic, database operations and types. The types are used by the schema, but not exposed to the public API.

## Directories

- `/db/*`
  - Each file exports a class that performs database operations related to a specific prisma model
- `/*`
  - Each file has functions related to a specific type of model