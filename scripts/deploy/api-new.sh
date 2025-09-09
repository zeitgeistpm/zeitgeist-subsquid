#!/bin/bash
__usage="
Usage: ./scripts/deploy/api.sh <first> <second>
Options for <first>:
  stop        Stop the already running api
Options for <second>:
  start       Build & start api
"

if [ "$1" = "stop" ]; then
  echo "Stopping api..."
  docker stop api sub-api || true
  docker rm api sub-api || true
  exit
elif [ "$2" = "start" ]; then
  echo "Building api..."
  # Use unified target since api target no longer exists
  docker build . --target unified -t api
  echo "Starting api..."
else
  echo "$__usage"
  exit
fi

if [ "$1" = "test" ] || [ "$1" = "main" ]; then
  # Auto-load environment variables
  if [ -f ".env.$1" ]; then
    set -a
    source .env.$1
    set +a
    echo "✅ Loaded environment from .env.$1"
  fi

  # Use dynamic network name based on environment
  NETWORK_NAME="zeitgeist-subsquid-$1"
  
  echo "Using network: $NETWORK_NAME"
  
  # Stop existing containers
  docker stop api sub-api 2>/dev/null || true
  docker rm api sub-api 2>/dev/null || true
  
  # Start API container (GraphQL server on port 4350)
  docker run -d --restart=always \
    --network=$NETWORK_NAME \
    -p 4350:4350 \
    -e NODE_ENV=$1 \
    -e REDIS_HOST=cache \
    -e REDIS_PORT=6379 \
    -e REDIS_PASS=${REDIS_PASS} \
    -e DB_HOST=db \
    -e DB_PORT=5432 \
    -e DB_NAME=${POSTGRES_DB} \
    -e DB_USER=${POSTGRES_USER} \
    -e DB_PASS=${POSTGRES_PASSWORD} \
    -e GQL_PORT=4350 \
    --env-file=.env.$1 \
    --name=api api \
    yarn run api:start

  # Start Sub-API container (GraphQL server on port 4000)
  docker run -d --restart=always \
    --network=$NETWORK_NAME \
    -p 4000:4000 \
    -e NODE_ENV=$1 \
    -e REDIS_HOST=cache \
    -e REDIS_PORT=6379 \
    -e REDIS_PASS=${REDIS_PASS} \
    -e DB_HOST=db \
    -e DB_PORT=5432 \
    -e DB_NAME=${POSTGRES_DB} \
    -e DB_USER=${POSTGRES_USER} \
    -e DB_PASS=${POSTGRES_PASSWORD} \
    -e GQL_PORT=4000 \
    --env-file=.env.$1 \
    --name=sub-api api \
    yarn run api:start

  # Wait for containers to start
  sleep 10

  # Temporary fix for type-graphql issue. Follow #347 for more info.
  docker cp node_modules/type-graphql/dist/resolvers/validate-arg.js api:/indexer/node_modules/type-graphql/dist/resolvers/validate-arg.js
  docker cp node_modules/type-graphql/dist/resolvers/validate-arg.js sub-api:/indexer/node_modules/type-graphql/dist/resolvers/validate-arg.js
  docker restart api
  docker restart sub-api
  
  echo "✅ API deployment completed"
  echo "API running on port 4350, Sub-API on port 4000"
else
  echo "$__usage"
fi