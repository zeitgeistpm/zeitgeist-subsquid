#!/bin/sh

__usage="
Usage: ./scripts/query-node.sh <first> <second>

Options for <first>:
  local       Query data on local chain
  dev         Query data on battery-station (dev chain)
  stop        Stop the already running query-node

Options for <second>:
  start       Build & start query-node
"

if [ "$1" = "stop" ]; then
  echo "Stopping query-node..."
  docker stop zeitgeist-query-node
  exit
elif [ "$2" = "start" ]; then
  echo "Building query-node..."
  docker build . --target query-node -t query-node
  echo "Starting query-node..."
else
  echo "$__usage"
  exit
fi

# Use "--network=host" or "-p 4350:4350" in case of db connection issues
if [ "$1" = "local" ]; then
  docker run -d --network=host --rm -e NODE_ENV=local --env-file=.env.local --name=zeitgeist-query-node query-node
elif [ "$1" = "dev" ]; then
  docker run -d -p 4350:4350 --rm -e NODE_ENV=dev --env-file=.env.dev --name zeitgeist-query-node query-node
elif [ "$1" = "d" ] || [ "$1" = "t1" ] || [ "$1" = "t2" ] || [ "$1" = "m1" ] || [ "$1" = "m2" ]; then
  docker run -d --network=host --rm -e NODE_ENV=$1 --env-file=.env.$1 --name=zeitgeist-query-node query-node  
else
  echo "$__usage"
fi