#!/bin/bash

docker container exec -it influxdb influx -precision rfc3339
