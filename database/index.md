## Database

- A postgres-database using docker. This is used for development and testing.

- The real database lives in AWS-rds, but behaves exactly like the database configured here.

- We use the postgres extension `pgtap` for testing the created database-schemas. (https://pgtap.org/)

### Migrations

- The database tests and migrations are handled by the `migrate` service.

### Running the database
`docker-compose up postgres --build`

### Browsing the database via psql
```bash
# Accessing the postgres-database inside docker
docker-compose exec postgres psql testdb testuser

# Exit with the command \q
```