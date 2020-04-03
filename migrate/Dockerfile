FROM migrate/migrate:v4.10.0

RUN apk add gettext

RUN addgroup -S migrategroup && adduser -S migrateuser -G migrategroup
RUN mkdir /database && chown -R migrateuser:migrategroup database

COPY ./cbin/run.sh .
RUN chmod +x run.sh && chmod +x migrate

COPY ./migrations database/migrations

USER migrateuser
ENTRYPOINT [ "sh", "./run.sh" ]