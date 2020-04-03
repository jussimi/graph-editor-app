FROM postgres:12.2

RUN apt-get update && apt-get install gettext -y

# Create new directory for logs
# Note that "postgres" is the user in the container, hence the chmod.
RUN mkdir /logs && touch /logs/postgresql.log && chown -R postgres:postgres /logs && \
  mkdir /database && chown -R postgres:postgres /database

COPY ./init.sql ./extensions.sql ./database/

COPY ./cbin/init.sh /docker-entrypoint-initdb.d

EXPOSE 5432

CMD [\
  "-c", "logging_collector=on", "-c", "log_directory=/logs", \
  "-c", "log_filename=postgresql.log", "-c", "log_statement=all", "-c", "max_connections=100" \
]