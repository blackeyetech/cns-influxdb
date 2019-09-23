#!/bin/bash

GRAFANA_DIR=$1

if [[ -z $GRAFANA_DIR ]]
then
  echo "Please specify the Grafana directory"
  exit 1
fi

ID=$(id -u)

docker run --rm -u $ID -p 3000:3000 --name=grafana -v $GRAFANA_DIR:/var/lib/grafana \
  grafana/grafana