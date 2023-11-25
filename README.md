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

## Production

Build for production and run:

```shell
bun build && bun start
```

## Integration

Linting, formatting, and testing is automatically performed by GitHub Actions on pull requests to the `main` branch.

- Run ESLint manually with `bun lint` or `bun lint:fix`
- Run Prettier manually with `bun format` or `bun format:fix`
- Run Vitest manually with `bun test` or `bun test:coverage`

## Deployment

The system can be built for production and deployed using Docker.

Build the docker image:

```shell
docker build -t arrigt:<tag> .
```

Run the container:

```shell
docker run -d --name arrigt arrigt:<tag>
```

## Documents

Specification and documentation resides in the `./docs` directory of the project.