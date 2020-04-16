## End-to-end tests

We use cypress for creating end-to-end tests.

For now the docker-image supports only running the tests via headless-chrome

The e2e-tests require the whole stack to be running in order to work.

A local installation of npm packages is not required, but useful since the `intellisense` features won't work properly without it.

### Run with docker-compose
```bash
# Build
docker-compose build e2e

# Run
docker-compose run --rm e2e
```

### Run with local npm installation
```
npm install
npm run cypress:open
```