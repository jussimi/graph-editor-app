FROM postgres:12.2-alpine

RUN apk add gettext

COPY ./scripts/init.sh /docker-entrypoint-initdb.d
COPY ./data /data

# Give write access to /data
RUN chmod -R 777 /data

EXPOSE 5432
