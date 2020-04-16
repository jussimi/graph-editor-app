## Migrate

- A database migration and testing tool using `docker`. (needs a better name)

- This service is strongly linked to the database and requires the database to be running in order to work.

- Is used in production.

### Schema-design
- This project uses `postgraphile`, which is a `graphql` framework created for postgres. The schema is built using the guidelines defined here: https://www.graphile.org/postgraphile/postgresql-schema-design/

- The schema uses some non-standard sql-featues:
  1. `Row-level-security` and `row-security-policies`. They enable a schema design that allows every user only to access their own data. Also it revokes every permission by default, and every operation must be explicitly granted. (https://www.postgresql.org/docs/9.5/ddl-rowsecurity.html)
  2. `JSONB`-type columns. JSONB is a column type that is used to store JSON-data. It has some basic validation and can be indexed. (https://www.postgresql.org/docs/9.4/datatype-json.html)

### Migrations

- This service uses a migration tool called `golang-migrate` for running the up- and down-migrations. (https://github.com/golang-migrate/migrate)

- Every database migration should have an `up.sql` file that contains the changes, and then a `down.sql` file that reverts the changes. When running a new migration, we can then revert to the previous version if the changes had some issues.

- The down-migrations should rarely be used. Instead, when something goes wrong, we should write a new migration that fixes the broken things in the previous version.

- The migrations should be written using environment variables for the secrets. The variables get substituted to the real values when the migrations are run.

### Tests

- The database has a postgres extension `pgtap` installed. We use that for running some basic tests on the database. (https://pgtap.org/)

- The tests contain schema-validation and sanity-testing.


### Commands
Normally the compose files handle the correct environment and entrypoint. If you need to run the migrations separately you can use the commands below.

The dockerfile has three different entrypoints depending on the environment:
  - `run.sh` is the default and is used in production. It just runs the commands and fails if it doesn't have access to the database.
  - `dev.sh` is used in development and waits for the database to start before running the migrations. (TODO: needs a timeout.)
  - `test.sh` runs the migration up and down and then runs the test-files.

Before you run these make sure that the database is running.

Running migrations up:
```
docker-compose run --rm migrate up
```

Running migrations down:
```
docker-compose run --rm migrate down -all
```

Running the tests:
```
docker-compose run --rm --entrypoint ./test.sh migrate
```
