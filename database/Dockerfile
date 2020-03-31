FROM postgres:12.2

RUN apt-get update && \
    apt-get install -y gettext pwgen iputils-ping curl apt-transport-https entr && \
    curl -L https://packagecloud.io/golang-migrate/migrate/gpgkey | apt-key add - && \
    echo "deb https://packagecloud.io/golang-migrate/migrate/ubuntu/ xenial main" > /etc/apt/sources.list.d/migrate.list && \
    apt-get update && \
    apt-get install -y migrate

# Make directory /data and allow access to every user (TODO: make safe)
RUN mkdir -p migrations
RUN chmod -R 777 /migrations

COPY ./cbin/init.sh /docker-entrypoint-initdb.d
COPY ./cbin/migrate.sh .
RUN  chmod +x migrate.sh

COPY /migrations /tmp_migrations

EXPOSE 5432

#CMD ["./migrate.sh", "up"]