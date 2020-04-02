#!/bin/bash
./setup.sh &
./docker-entrypoint.sh postgres $@
