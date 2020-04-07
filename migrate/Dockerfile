FROM migrate/migrate:v4.10.0

RUN apk add gettext postgresql-client bash

RUN addgroup -S migrategroup && adduser -S migrateuser -G migrategroup
RUN mkdir /database && chown -R migrateuser:migrategroup database

COPY ./cbin ./
RUN chmod +x run.sh dev.sh test.sh migrate

COPY ./migrations database/migrations
COPY ./tests database/tests

USER migrateuser
ENTRYPOINT [ "./run.sh" ]
