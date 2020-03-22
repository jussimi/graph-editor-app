#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASS' CREATEROLE;
    CREATE DATABASE $DB_NAME;
    GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOSQL

psql testdb postgres <<-EOSQL
    CREATE EXTENSION pgcrypto;
EOSQL

# Loop through all files in data (note that we have been given write access in Dockerfile)
FILES=/tmp_data/*
for file in $FILES
do
  f=`basename $file`
  envsubst < "$file" > "data/$f"
  # migrate each file
  psql testdb testuser -f "data/$f"
done
