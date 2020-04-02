#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd $SCRIPT_DIR

FIRST_COMMAND=$1
MIGRATE_COMMANDS=${@:1}

ENV_FILE=$SCRIPT_DIR/../.env
. $ENV_FILE
source $ENV_FILE
export $(cut -d= -f1 $ENV_FILE)

mkdir -p $SCRIPT_DIR/tmp
if [ "$FIRST_COMMAND" = "up" -o "$FIRST_COMMAND" = "down" -o "$FIRST_COMMAND" = "goto" ]; then
  echo "substitute variables"
  FILES=migrations/*
  for file in $FILES
  do
    f=`basename $file`
    envsubst < "$file" > "$SCRIPT_DIR/tmp/$f"
  done
fi
# echo "postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable"

docker run \
  --volume $SCRIPT_DIR/tmp:/migrations \
  --network host migrate/migrate \
  -path=/migrations/ \
  -verbose \
  -database postgres://testuser:testpass@localhost:5432/testdb?sslmode=disable $MIGRATE_COMMANDS

rm -rf $SCRIPT_DIR/tmp
