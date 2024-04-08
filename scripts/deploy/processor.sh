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
  echo "Shutting down..."
  docker stop $(docker ps -a -q)
  docker rm $(docker ps -a -q)
  echo "Starting database..."
  yarn db:up
  echo "Building processor..."
  docker build . --target processor -t processor
  echo "Starting processor..."
else
  echo "$__usage"
  exit
fi

if [ "$1" = "test" ] || [ "$1" = "main" ]; then
  docker run -d --restart=always --network=host -e NODE_ENV=$1 --env-file=.env.$1 --name=zeitgeist-processor processor
else
  echo "$__usage"
fi