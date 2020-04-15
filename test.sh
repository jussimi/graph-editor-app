#!/bin/sh
# set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd $SCRIPT_DIR

# Run
SUCCESS=0
EXIT_CODE=1

# Run unit tests with the dev-environment.
COMPOSE=$(echo "docker-compose -f docker-compose.yml -f docker-compose.test.yml")
$COMPOSE build
# Test migrate
$COMPOSE run --rm --entrypoint ./test.sh migrate run --rm postgres; EXIT_CODE=$?
if [ $EXIT_CODE != 0 ]; then
  echo "Migrate failed with code $EXIT_CODE."
  $COMPOSE down
  exit $EXIT_CODE
fi

# Test api unit and integration tests.
# NOTE: This requires that the database is still running.
$COMPOSE run --rm api npm run test; EXIT_CODE=$?
if [ $EXIT_CODE != 0 ]; then
  echo "Api failed with code $EXIT_CODE."
  $COMPOSE down
  exit $EXIT_CODE
fi

# Run end-to-end tests with the production-preview environment.
COMPOSE=$(echo "docker-compose -f docker-compose.yml -f docker-compose.test.yml -f docker-compose.preview.yml")
$COMPOSE build
$COMPOSE up -d postgres migrate api ui
$COMPOSE run --rm e2e; EXIT_CODE=$?
if [ $EXIT_CODE != 0 ]; then
  echo "End-to-end tests failed with code $EXIT_CODE."
  $COMPOSE down
  exit $EXIT_CODE
fi

$COMPOSE down
exit $SUCCESS
