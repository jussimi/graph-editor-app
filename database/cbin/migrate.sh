#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd $SCRIPT_DIR

DATA_DIR=$SCRIPT_DIR/database
FIRST_COMMAND=$1
MIGRATE_COMMANDS=${@:1}

mkdir -p $DATA_DIR/tmp
if [ "$FIRST_COMMAND" = "up" -o "$FIRST_COMMAND" = "down" -o "$FIRST_COMMAND" = "goto" ]; then
  echo "substitute variables"
  FILES=$DATA_DIR/migrations/*
  for file in $FILES
  do
    f=`basename $file`
    envsubst < "$file" > "$DATA_DIR/tmp/$f"
  done
fi
echo "postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable"

migrate -source file://$DATA_DIR/tmp \
  -verbose \
  -database postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable \
  $MIGRATE_COMMANDS

rm -rf $SCRIPT_DIR/tmp
