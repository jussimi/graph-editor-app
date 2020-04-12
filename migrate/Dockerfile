FROM migrate/migrate:v4.10.0

RUN apk add gettext postgresql-client bash

RUN addgroup -S migrategroup && adduser -S migrateuser -G migrategroup
RUN mkdir /data && chown -R migrateuser:migrategroup data

COPY ./cbin ./
RUN chmod +x run.sh dev.sh test.sh migrate

COPY ./src data/src

USER migrateuser
ENTRYPOINT [ "./run.sh" ]
