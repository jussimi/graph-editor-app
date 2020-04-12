#!/bin/bash
# NOTE: THIS IS LEGACY. LEAVING THIS HERE FOR A REMINDER ON SOME SCRIPTS.
# NOTE: THIS IS LEGACY. LEAVING THIS HERE FOR A REMINDER ON SOME SCRIPTS.
# NOTE: THIS IS LEGACY. LEAVING THIS HERE FOR A REMINDER ON SOME SCRIPTS.
# NOTE: THIS IS LEGACY. LEAVING THIS HERE FOR A REMINDER ON SOME SCRIPTS.
# NOTE: THIS IS LEGACY. LEAVING THIS HERE FOR A REMINDER ON SOME SCRIPTS.
# NOTE: THIS IS LEGACY. LEAVING THIS HERE FOR A REMINDER ON SOME SCRIPTS.
# NOTE: THIS IS LEGACY. LEAVING THIS HERE FOR A REMINDER ON SOME SCRIPTS.
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd $SCRIPT_DIR

docker-compose down

if [ "$2" = "build" ]; then
  docker-compose build
fi

if [ "$1" = "prod" ]; then
  echo "start postgres in production-mode (for local testing)"
  docker-compose -f docker-compose.yml up -d postgres
else
  echo "start postgres in development"
  docker-compose up -d postgres
fi

# Grep the postgres-log and check if the 'ready to accept connections'-string is there twice.
#  -> when it is there twice the database can be migrated
until docker exec -i graph-editor-app_postgres_1 grep -Pzl '(?s)ready to accept connections*\n.*ready to accept connections' logs/postgresql.log > /dev/null; do
 sleep 2
 echo "waiting for postgres to start..."
done
sleep 1
echo "postgres started!"

if [ "$1" = "prod" ]; then
  echo "start everything in production-mode (for local testing)"
  docker-compose -f docker-compose.yml up api ui migrate
else
  echo "start everything in development"
  docker-compose up api ui migrate
fi


#docker-compose logs --tail=1000 -f