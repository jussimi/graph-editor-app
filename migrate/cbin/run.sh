#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd $SCRIPT_DIR

DATA_DIR=$SCRIPT_DIR/data
SRC_DIR=$DATA_DIR/src
FIRST_COMMAND=$1
MIGRATE_COMMANDS=${@}

mkdir -p $DATA_DIR/tmp
if [ "$FIRST_COMMAND" = "up" -o "$FIRST_COMMAND" = "down" -o "$FIRST_COMMAND" = "goto" ]; then
  FILES=$SRC_DIR/migrations/*
  for file in $FILES
  do
    f=`basename $file`
    envsubst < "$file" > "$DATA_DIR/tmp/$f"
  done
fi

migrate -path /$DATA_DIR/tmp \
  -verbose \
  -database $OWNER_DB_URL \
  $MIGRATE_COMMANDS

rm -rf $DATA_DIR/tmp
