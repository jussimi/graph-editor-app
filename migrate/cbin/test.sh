#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd $SCRIPT_DIR
SRC_DIR=$SCRIPT_DIR/src

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
mkdir -p $SRC_DIR/tmp_tests
FILES=$SRC_DIR/tests/*
for file in $FILES
do
  f=`basename $file`
  envsubst < "$file" > "$SRC_DIR/tmp_tests/$f"
  echo -e "TEST: $f"
  psql $OWNER_DB_URL -Xf $SRC_DIR/tmp_tests/$f > $SRC_DIR/test_result
  cat $SRC_DIR/test_result
  if echo "$(tail -n 1 $SRC_DIR/test_result)" | grep -qi "looks like you failed"; then
    exit 1
  fi
  echo ""
done

echo "Migrations and unit tests passed."
