#!/bin/bash

DB_DIR=$1

if [[ -z $DB_DIR ]]
then
  echo "Please specify the DB directory"
  exit 1
fi

docker run -p 8086:8086 --rm --name influxdb -v $DB_DIR:/var/lib/influxdb influxdb
