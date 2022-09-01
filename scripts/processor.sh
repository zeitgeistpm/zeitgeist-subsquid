#!/bin/sh

__usage="
Usage: ./scripts/processor.sh <first> <second>

Options for <first>:
  local       Process data from local chain
  dev         Process data from battery-station (dev chain)
  stop        Stop the running processor

Options for <second>:
  start       Build processor services & start processor
  resume      Resume processor
  restart     Stop, build and start afresh
"

if [ "$1" = "stop" ]; then
  echo "Stopping processor..."
  docker stop zeitgeist-processor
  exit
elif [ "$2" = "start" ]; then
  echo "Building processor..."
  docker build . --target processor -t processor
  yarn db:up && yarn redis:up && yarn db:reset && yarn db:migrate
  echo "Starting processor..."
elif [ "$2" = "resume" ]; then
  echo "Resuming processor..."
elif [ "$2" = "restart" ]; then
  echo "Stopping processor..."
  docker stop zeitgeist-processor
  echo "Stopping query-node..."
  docker stop zeitgeist-query-node
  echo "Building processor..."
  docker build . --target processor -t processor
  yarn db:up && yarn redis:up && yarn db:reset && yarn db:migrate
  echo "Starting processor..."
else
  echo "$__usage"
  exit
fi

# Use "--network=host" or "-p 4350:4350" in case of db connection issues
if [ "$1" = "dev" ]; then
  docker run -d -p 9090:9090 --rm -e NODE_ENV=dev --env-file=.env.dev --name=zeitgeist-processor processor
elif [ "$1" = "local" ]; then
  sleep 15 # Wait for local node to be up
  docker run -d --network=host --rm -e NODE_ENV=local --env-file=.env.local --name=zeitgeist-processor processor
elif [ "$1" = "d" ] || [ "$1" = "t1" ] || [ "$1" = "t2" ] || [ "$1" = "m1" ] || [ "$1" = "m2" ]; then
  docker run -d --network=host --rm -e NODE_ENV=$1 --env-file=.env.$1 --name=zeitgeist-processor processor
else
  echo "$__usage"
fi