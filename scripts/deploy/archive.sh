#!/bin/sh
cd archive

__usage="
Usage: ./scripts/deploy/archive.sh <first> <second>

Options for <first>:
  local       Index data from local chain
  dev         Index and explore data from battery-station
  test        Index data from battery-station
  main        Index data from main node

Options for <second>:
  up        Build & start archive
  down      Stop & remove archive
"

# Control points of archive
if [ "$2" = "up" ]; then
  cmd="up -d"
else
  cmd=$2
fi

# Index data from local-network or battery-station or main-net by passing below argument
# Details are specified in docker-compose*.yml files in archive directory
if [ "$1" = "local" ] || [ "$1" = "dev" ] || [ "$1" = "test" ] || [ "$1" = "main" ]; then
  docker-compose -f ./docker-compose.yml -f ./docker-compose.$1.yml $cmd
else
  echo "$__usage"
fi
