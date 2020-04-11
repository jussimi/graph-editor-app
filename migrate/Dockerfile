FROM migrate/migrate:v4.10.0

RUN apk add gettext postgresql-client bash

RUN addgroup -S migrategroup && adduser -S migrateuser -G migrategroup
RUN mkdir /src && chown -R migrateuser:migrategroup src

COPY ./cbin ./
RUN chmod +x run.sh dev.sh test.sh migrate

COPY ./src src/

USER migrateuser
ENTRYPOINT [ "./run.sh" ]
