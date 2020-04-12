#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd $SCRIPT_DIR
DATA_DIR=$SCRIPT_DIR/data
SRC_DIR=$DATA_DIR/src

until psql $OWNER_DB_URL -c '\q'; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "Postgres is up - executing command"

# Run migrations up
./run.sh up

# Run migrations down
./run.sh down -all

# And run them up again
./run.sh up

echo "Migrations OK!"
echo "Test unit tests"
# Run unit tests
mkdir -p $DATA_DIR/tmp_tests
FILES=$SRC_DIR/tests/*
for file in $FILES
do
  f=`basename $file`
  envsubst < "$file" > "$DATA_DIR/tmp_tests/$f"
  echo -e "TEST: $f"
  psql $OWNER_DB_URL -Xf $DATA_DIR/tmp_tests/$f > $DATA_DIR/test_result
  cat $DATA_DIR/test_result
  if echo "$(tail -n 1 $DATA_DIR/test_result)" | grep -qi "looks like you failed"; then
    exit 1
  fi
  echo ""
done

echo "Migrations and unit tests passed."
