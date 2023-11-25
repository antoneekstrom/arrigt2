FROM node:21.2.0 as base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install

# install bun
RUN curl -fsSL https://bun.sh/install | BUN_INSTALL=/usr bash -s "bun-v1.0.14"

# install all dependencies (include devDependencies)
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && /usr/bin/bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && /usr/bin/bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM install AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# build remix for production
RUN /usr/bin/bun run build:remix
# bundle with esbuild to run with node
RUN /usr/bin/bun run build:bundle

# copy production dependencies into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/build ./build
COPY --from=prerelease /usr/src/app/public ./public
COPY --from=prerelease /usr/src/app/package.json .

# run the app
ENV NODE_ENV=production
EXPOSE 4000
ENTRYPOINT [ "npm", "start" ]
