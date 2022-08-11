#!/bin/sh

# Control points of processor
if [ "$1" = "-start" ]; then
  echo "Building processor..."
  docker build . --target processor -t processor
  echo "Starting processor..."
  yarn db:up && yarn redis:up && yarn db:reset && yarn db:migrate
elif [ "$1" = "-resume" ]; then
  echo "Resuming processor..."
elif [ "$1" = "-stop" ]; then
  echo "Stopping processor..."
  docker stop zeitgeist-processor
  exit
else
  echo "Please specify first argument with -start or -resume or -stop"
  exit
fi

# Process data from local-network or battery-station or main-net by passing below argument
# For Linux, replace -p 9090:9090 with --network=host
if [ "$2" = "-local" ]; then
  docker run -d -p 9090:9090 --rm -e NODE_ENV=local --env-file=.env.local --name zeitgeist-processor processor
elif [ "$2" = "-dev" ]; then
  docker run -d -p 9090:9090 --rm -e NODE_ENV=dev --env-file=.env.dev --name zeitgeist-processor processor
elif [ "$2" = "-t1" ]; then
  docker run -d --network=host --rm -e NODE_ENV=t1 --env-file=.env.t1 --name zeitgeist-processor processor
elif [ "$2" = "-t2" ]; then
  docker run -d --network=host --rm -e NODE_ENV=t2 --env-file=.env.t2 --name zeitgeist-processor processor
elif [ "$2" = "-m1" ]; then
  docker run -d --network=host --rm -e NODE_ENV=m1 --env-file=.env.m1 --name zeitgeist-processor processor
elif [ "$2" = "-m2" ]; then
  docker run -d --network=host --rm -e NODE_ENV=m2 --env-file=.env.m2 --name zeitgeist-processor processor
else
  echo "Please specify second argument with -local or -dev"
fi