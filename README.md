## Development

Bun is required to build and run the system locally.

Install dependencies:

```shell
bun install
```

Start development server with hot-reload:

```shell
bun dev
```

### Database

Docker is required to run the database locally.

Start only the container with the database from `docker-compose.yaml`:

```shell
docker compose up -d --build arrigt-db
```

Apply migrations:

```shell
bun run migrate:dev
```

## Production

Build for production and run:

```shell
bun build && bun start
```

## Integration

Linting, formatting, and testing is automatically performed by GitHub Actions on pull requests to the `main` branch.

- Run ESLint manually with `bun run lint` or `bun run lint:fix`
- Run Prettier manually with `bun run format` or `bun run format:fix`
- Run Vitest manually with `bun run test` or `bun run test:coverage`
- Run Stryker manually with `bun run test:mutation`

## Deployment

The system can be built for production and deployed using Docker. The `docker-compose.yaml` runs the following

Build the docker images:

```shell
docker compose build
```

Run the containers:

```shell
docker compose up -d
```

## Documents

Specification and documentation resides in the `./docs` directory of the project.