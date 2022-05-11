#!/bin/sh
docker-compose up -d
yarn db:reset
yarn db:migrate
yarn build

# override environment variables from .env file
#   and run compiled js code
WS_NODE_URL=ws://127.0.0.1:9944 \
IPFS_CLIENT_URL=http://127.0.0.1:5001 \
INDEXER_ENDPOINT_URL=http://127.0.0.1:4010/v1/graphql \
    node -r dotenv-expand/config \
    lib/processor/testnet/index.js \
    dotenv_config_debug=true
