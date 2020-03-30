FROM postgres:12.2-alpine

RUN apk add gettext

COPY ./scripts/init.sh /docker-entrypoint-initdb.d

# Make directory /data and allow access to every user (TODO: make safe)
RUN mkdir -p data
RUN chmod -R 777 /data

COPY /data /tmp_data

EXPOSE 5432
