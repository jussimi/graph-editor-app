FROM postgres:12.2

RUN apt-get update && \
    apt-get install -y gettext pwgen iputils-ping curl apt-transport-https entr && \
    curl -L https://packagecloud.io/golang-migrate/migrate/gpgkey | apt-key add - && \
    echo "deb https://packagecloud.io/golang-migrate/migrate/ubuntu/ xenial main" > /etc/apt/sources.list.d/migrate.list && \
    apt-get update && \
    apt-get install -y migrate

# Create new logs and tmp directories.
# Note that "postgres" is the user in the container, hence the chmod.
RUN mkdir /logs && touch /logs/postgresql.log && chmod -R 777 /logs && mkdir /database && chmod -R 777 /database

# Add migrate.sh
COPY ./cbin/migrate.sh .
RUN chmod +x migrate.sh

COPY ./cbin/init.sh /docker-entrypoint-initdb.d
COPY ./migrations /database/migrations

EXPOSE 5432

CMD [\
  "-c", "logging_collector=on", "-c", "log_directory=/logs", \
  "-c", "log_filename=postgresql.log", "-c", "log_statement=all", "-c", "max_connections=100" \
]