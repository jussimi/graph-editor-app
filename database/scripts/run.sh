#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

docker run \
  --name graph_editor_postgresql \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  --rm -d \
  -v ${DIR}/../data/100_init.sql:/100_init.sql \
  -v ${DIR}/init.sh:/docker-entrypoint-initdb.d/init.sh \
  postgres:12.2-alpine
