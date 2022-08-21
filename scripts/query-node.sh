#!/bin/sh

if [ "$2" = "start" ]; then
  echo "Building query-node..."
  docker build . --target query-node -t query-node
  echo "Starting query-node..."
elif [ "$2" = "stop" ]; then
  echo "Stopping query-node..."
  docker stop zeitgeist-query-node
else
  echo "Second argument should be either `start` or `resume`"
  exit
fi

# Process data from local-network or battery-station or main-net by passing below argument
# For Linux, add --network=host
if [ "$1" = "dev" ]; then
  docker run -d -p 4350:4350 --rm -e NODE_ENV=dev --env-file=.env.dev --name zeitgeist-query-node query-node
elif [ "$1" = "local" ] || [ "$1" = "t1" ] || [ "$1" = "t2" ] || [ "$1" = "m1" ] || [ "$1" = "m2" ]; then
  docker run -d --network=host --rm -e NODE_ENV=$1 --env-file=.env.$1 --name=zeitgeist-query-node query-node  
else
  echo "First argument should be either `local` or `dev`"
fi