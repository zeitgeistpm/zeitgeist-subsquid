#!/bin/sh

__usage="
Usage: ./scripts/deploy/processor.sh <first> <second>

Options for <first>:
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
  echo "Starting services..."
  yarn db:up
  docker build . --target processor -t processor
  echo "Starting processor..."
elif [ "$2" = "resume" ]; then
  echo "Building processor..."
  docker build . --target processor -t processor
  echo "Resuming processor..."
elif [ "$2" = "restart" ]; then
  echo "Stopping processor..."
  docker stop zeitgeist-processor
  echo "Stopping api..."
  docker stop api
  docker stop sub-api
  echo "Restarting database..."
  yarn db:restart
  echo "Building processor..."
  docker build . --target processor -t processor
  echo "Starting processor..."
else
  echo "$__usage"
  exit
fi

if [ "$1" = "test" ] || [ "$1" = "main" ]; then
  docker run -d --network=host --rm -e NODE_ENV=$1 --env-file=.env.$1 --name=zeitgeist-processor processor
else
  echo "$__usage"
fi