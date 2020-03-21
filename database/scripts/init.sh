#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER testuser WITH PASSWORD 'testpass' CREATEROLE;
    CREATE DATABASE testdb;
    GRANT ALL PRIVILEGES ON DATABASE testdb TO testuser;
EOSQL

psql testdb postgres <<-EOSQL
    CREATE EXTENSION pgcrypto;
EOSQL

psql testdb testuser -f 100_init.sql