FROM postgres:12.2-alpine

# Make directory /data and allow access to every user (TODO: make safe)
RUN mkdir -p migrations
RUN chmod -R 777 /migrations

COPY ./init.sh /docker-entrypoint-initdb.d

COPY /migrations /tmp_migrations

EXPOSE 5432

#CMD ["./migrate.sh", "up"]