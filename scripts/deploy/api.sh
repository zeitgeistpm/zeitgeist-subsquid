#!/bin/sh

__usage="
Usage: ./scripts/deploy/api.sh <first> <second>

Options for <first>:
  stop        Stop the already running api

Options for <second>:
  start       Build & start api
"

if [ "$1" = "stop" ]; then
  echo "Stopping api..."
  docker stop api
  docker stop sub-api || true
  exit
elif [ "$2" = "start" ]; then
  echo "Building api..."
  docker build . --target query-node -t query-node
  echo "Starting api..."
else
  echo "$__usage"
  exit
fi

if [ "$1" = "test" ] || [ "$1" = "main" ]; then
  docker run -d --restart=always --network=host -e NODE_ENV=$1 --env-file=.env.$1 --name=api query-node
  docker run -d --restart=always --network=host -e GQL_PORT=4000 -e NODE_ENV=$1 --env-file=.env.$1 --name=sub-api query-node

  # Temporary fix for type-graphql issue. Follow #347 for more info.
  docker cp node_modules/type-graphql/dist/resolvers/validate-arg.js api:/home/zeitgeist-squid/node_modules/type-graphql/dist/resolvers/validate-arg.js
  docker cp node_modules/type-graphql/dist/resolvers/validate-arg.js sub-api:/home/zeitgeist-squid/node_modules/type-graphql/dist/resolvers/validate-arg.js
  docker restart api
  docker restart sub-api
else
  echo "$__usage"
fi