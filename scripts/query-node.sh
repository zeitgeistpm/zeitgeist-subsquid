#!/bin/sh

# Control points of query-node
if [ "$1" = "-start" ]; then
  echo "Building query-node..."
  docker build . --target query-node -t query-node
  echo "Starting query-node..."
  # For Linux, replace -p 4350:4350 with --network=host
  docker run -d -p 4350:4350 --rm -e NODE_ENV=dev --env-file=.env.dev --name zeitgeist-query-node query-node  
elif [ "$1" = "-stop" ]; then
  echo "Stopping query-node..."
  docker stop zeitgeist-query-node
  exit
else
  echo "Please specify first argument with -start or -stop"
  exit
fi