# Initial readme

## Run in development mode
```
docker-compose up --build
```
In development mode the `ui` and `api` listen to file-changes. (hot-reload)

The --build flag is required only on the first startup, or when installing new npm packages.

## Run in production mode
```
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

In production mode, the `ui` and `api` are bundled and minified.

## Restart
```
docker-compose down
docker-compose up
```
