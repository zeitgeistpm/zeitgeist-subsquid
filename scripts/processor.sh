#!/bin/sh

# Control points of processor
if [ "$1" = "stop" ]; then
  echo "Stopping processor..."
  docker stop zeitgeist-processor
  exit
fi

if [ "$2" = "start" ]; then
  echo "Building processor..."
  docker build . --target processor -t processor
  echo "Starting processor..."
  yarn db:up && yarn redis:up && yarn db:reset && yarn db:migrate
elif [ "$2" = "resume" ]; then
  echo "Resuming processor..."
else
  echo "Second argument should be either `start` or `resume`"
  exit
fi

# Process data from local-network or battery-station or main-net by passing below argument
# For Linux, add --network=host
if [ "$1" = "dev" ]; then
  docker run -d -p 9090:9090 --rm -e NODE_ENV=dev --env-file=.env.dev --name=zeitgeist-processor processor
elif [ "$1" = "local" ]; then
  sleep 10 # Wait for local node to be up
  docker run -d --network=host --rm -e NODE_ENV=local --env-file=.env.local --name=zeitgeist-processor processor
elif [ "$1" = "t1" ] || [ "$1" = "t2" ] || [ "$1" = "m1" ] || [ "$1" = "m2" ]; then
  docker run -d --network=host --rm -e NODE_ENV=$1 --env-file=.env.$1 --name=zeitgeist-processor processor
else
  echo "First argument should be either `local` or `dev`"
fi