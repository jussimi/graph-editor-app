#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd $SCRIPT_DIR

docker-compose down

if [ "$2" = "build" ]; then
  docker-compose build
fi

echo "start database"
docker-compose up -d postgresql

# Grep the postgres-log and check if the 'ready to accept connections'-string is there twice.
#  -> the database can be migrated
until docker exec -i graph_editor_db grep -Pzl '(?s)ready to accept connections*\n.*ready to accept connections' logs/postgresql.log > /dev/null; do
 sleep 2
 echo "waiting for postgres to start..."
done
sleep 1
echo "postgres started!"

echo "migrate database"
./database/migrate.sh up

echo "stop database"
docker-compose stop

if [ "$1" = "dev" ]; then
  echo "start everything in development"
  docker-compose up
elif [ "$1" = "prod" ]; then
  echo "start everything in production-mode (locally)"
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
fi

docker-compose up

#docker-compose logs --tail=1000 -f