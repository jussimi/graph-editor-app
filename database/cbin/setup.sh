#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd $SCRIPT_DIR

# Grep the postgres-log and check if the 'ready to accept connections'-string is there twice.
#  -> the database can be migrated
echo "start setup"
until grep -Pzl '(?s)ready to accept connections*\n.*ready to accept connections' logs/postgresql.log > /dev/null; do
 sleep 2
 echo "waiting for postgres to start..."
done
sleep 1
echo "postgres has started"

echo "migrate database"
./migrate.sh up

echo "setup done"
