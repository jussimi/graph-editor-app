#!/bin/bash
set -e
MIGRATE_COMMANDS=${@:1}

# Loop through all files in migrations (note that we have been given write access in Dockerfile)
FILES=/tmp_migrations/*
for file in $FILES
do
  f=`basename $file`
  envsubst < "$file" > "migrations/$f"
done

# Do migrations
echo "postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable"
migrate \
  -verbose \
  -path migrations \
  -database "postgres://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}?sslmode=disable" \
  ${MIGRATE_COMMANDS}
