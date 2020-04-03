#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd $SCRIPT_DIR

DATA_DIR=$SCRIPT_DIR/database
FIRST_COMMAND=$1
MIGRATE_COMMANDS=${@}

mkdir -p $DATA_DIR/tmp
if [ "$FIRST_COMMAND" = "up" -o "$FIRST_COMMAND" = "down" -o "$FIRST_COMMAND" = "goto" ]; then
  FILES=$DATA_DIR/migrations/*
  for file in $FILES
  do
    f=`basename $file`
    envsubst < "$file" > "$DATA_DIR/tmp/$f"
  done
fi

echo "connection string $OWNER_DB_URL"

migrate -path /$DATA_DIR/tmp \
  -verbose \
  -database $OWNER_DB_URL \
  $MIGRATE_COMMANDS

rm -rf $DATA_DIR/tmp
