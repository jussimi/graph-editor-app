FROM postgres:12.2-alpine

COPY ./data/100_init.sql /
COPY ./scripts/init.sh /docker-entrypoint-initdb.d

EXPOSE 5432
