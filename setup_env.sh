#!/bin/sh
FILE_TO_WRITE=$1
echo POSTGRES_PASSWORD=$POSTGRES_PASSWORD > $FILE_TO_WRITE
echo DB_HOST=$DB_HOST >> $FILE_TO_WRITE
echo DB_PORT=$DB_PORT >> $FILE_TO_WRITE
echo DB_NAME=$DB_NAME >> $FILE_TO_WRITE
echo DB_USER=$DB_USER >> $FILE_TO_WRITE
echo DB_PASS=$DB_PASS >> $FILE_TO_WRITE
echo GRAPH_EDITOR_SCHEMA=$GRAPH_EDITOR_SCHEMA >> $FILE_TO_WRITE
echo GRAPH_EDITOR_USER=$GRAPH_EDITOR_USER >> $FILE_TO_WRITE
echo GRAPH_EDITOR_USER_PASS=$GRAPH_EDITOR_USER_PASS >> $FILE_TO_WRITE
echo JWT_SECRET=$JWT_SECRET >> $FILE_TO_WRITE
echo OWNER_DB_URL=postgres://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=disable >> $FILE_TO_WRITE
echo GRAPHILE_DB_URL=postgres://$GRAPH_EDITOR_USER:$GRAPH_EDITOR_USER_PASS@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=disable >> $FILE_TO_WRITE
