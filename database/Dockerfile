FROM postgres:12.2 as builder

RUN apt-get update \
    && apt-get install -y build-essential gettext-base git-core libv8-dev curl postgresql-server-dev-$PG_MAJOR \
    && rm -rf /var/lib/apt/lists/*

# install pgtap
RUN git clone https://github.com/theory/pgtap.git \
    && cd pgtap \
    && make \
    && make install

FROM postgres:12.2

COPY --from=builder /usr/share/postgresql/12/extension/pgtap* /usr/share/postgresql/12/extension/

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