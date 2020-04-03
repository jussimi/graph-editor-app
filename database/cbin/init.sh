#!/bin/bash
set -e
cd /database

# Create files where the environment variables have been substituted.
envsubst < init.sql > env_init.sql
envsubst < extensions.sql > env_extensions.sql

# Initialize the new database.
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -a -f env_init.sql

# Create extensions
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$DB_NAME" -a -f env_extensions.sql
