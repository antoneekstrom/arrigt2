## Development

Node.js is required to run the application, the recommended version is specified in `package.json`.
The program is compiled and bundled by Vite, using the Remix plugin for Vite. 

### Configuration

Before starting the application after cloning the project, you will need to install dependencies
with `npm i` as well as generating code with `npm run generate`. After this you can either run a
development server with `npm run dev` or build for production by executing `npm run build` and
then running the server with `npm run start`.

The application also requires a database to function properly, which is covered in the next section.

### Database

Docker can be used to run the database locally. The `docker-compose.yaml` file specifies a properly
configured PostgreSQL database which can be start individually with `docker compose up -d --build arrigt-db
`.

## Integration

Linting, formatting, and testing is automatically performed by GitHub Actions on pull requests to
the `main` branch.

- Lint with `npm run lint` or `npm run lint:fix`
- Format with `npm run format` or `npm run format:fix`
- Run unit tests with `npm run test:unit`
- Run integration tests with `npm run test:integration`
- Run mutation tests with `npm run test:mutation`

## Deployment

The application can be built for production and deployed using Docker. The `docker-compose.yaml`
starts the following services:

- Remix webserver
- PostgreSQL database

Build the docker images:

```shell
docker compose build
```

Run the containers:

```shell
docker compose up -d
```

