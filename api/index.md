# Api
An `express` server written with typescript.

The server listens to only one graphql route:
  - The requests are handled by the `postgraphile` middleware. (https://www.graphile.org)
  - The allowed graphql-queries are whitelisted. Anything that is not from the whitelist will fail.
  - Also added `cors` and `rate-limiting` middleware.

Look at the code for more documentation.

A local installation of npm packages is not required, but useful since the `intellisense` features won't work properly without it.

## Run with docker
The docker-image uses multistage builds in order to create a smaller image for production. Look in [README.md](../README.md) for info on how to run different build targets and environments.

```bash
# build
docker-compose build api

# run
docker-compose up api

# tests
docker-compose run --rm api npm run test
```

## Local installation

```bash
npm install
```
