#!/bin/sh

__usage="
Usage: ./scripts/api.sh <first> <second>

Options for <first>:
  local       Query data on local chain
  mlocal      Query local chain running on mac
  dev         Query data on battery-station (dev chain)
  stop        Stop the already running api

Options for <second>:
  start       Build & start api
"

if [ "$1" = "stop" ]; then
  echo "Stopping api..."
  docker stop api
  docker stop sub-api
  exit
elif [ "$2" = "start" ]; then
  echo "Building api..."
  docker build . --target api -t api
  echo "Starting api..."
else
  echo "$__usage"
  exit
fi

if [ "$1" = "local" ]; then
  docker run -d --network=host --rm -e NODE_ENV=local --env-file=.env.local --name=api api
elif [ "$1" = "mlocal" ]; then
  docker run -d -p 4350:4350 --rm -e NODE_ENV=mlocal --env-file=.env.mlocal --name=api api
elif [ "$1" = "dev" ]; then
  docker run -d -p 4350:4350 --rm -e NODE_ENV=dev --env-file=.env.dev --name=api api
elif [ "$1" = "d" ] || [ "$1" = "t1" ] || [ "$1" = "t2" ] || [ "$1" = "m1" ] || [ "$1" = "m2" ]; then
  docker run -d --network=host --rm -e NODE_ENV=$1 --env-file=.env.$1 --name=api api
  docker run -d --network=host --rm -e GQL_PORT=4000 -e NODE_ENV=$1 --env-file=.env.$1 --name=sub-api api
else
  echo "$__usage"
fi