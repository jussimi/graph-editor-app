#!/bin/bash
set -e

until psql $OWNER_DB_URL -c '\q'; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "Postgres is up - executing command"

sh ./run.sh $@