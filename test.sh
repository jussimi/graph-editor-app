#!/bin/bash
# set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd $SCRIPT_DIR
docker-compose down
docker-compose build migrate

# Run
SUCCESS=0
EXIT_CODE=1
docker-compose -f docker-compose.yml -f docker-compose.test.yml run --rm migrate postgres; EXIT_CODE=$?
if [ $EXIT_CODE != 0 ]; then
  echo "Migrate failed with code $EXIT_CODE."
  exit $EXIT_CODE
fi

exit $SUCCESS
