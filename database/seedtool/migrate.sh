#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

ENV_FILE=${SCRIPT_DIR}/../../.env
. $ENV_FILE
source $ENV_FILE
export $(cut -d= -f1 $ENV_FILE)

mkdir -p ${SCRIPT_DIR}/tmp

FILES=../migrations/*
for file in $FILES
do
  f=`basename $file`
  envsubst < "$file" > "tmp/$f"
done

# Do migrations
# echo "postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable"

docker run \
  --volume ${SCRIPT_DIR}/tmp:/migrations \
  --network host migrate/migrate \
  -path=/migrations/ \
  -verbose \
  -database postgres://testuser:testpass@localhost:5432/testdb?sslmode=disable ${@}
