-- NOTE: Needs to be run with superuser privileges.
-- Creates a new user and a database.
CREATE USER $DB_USER WITH PASSWORD '${DB_PASS}' CREATEROLE;
CREATE DATABASE ${DB_NAME};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};