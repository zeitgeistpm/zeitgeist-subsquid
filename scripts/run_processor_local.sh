#!/bin/sh
docker-compose up -d

yarn db:create-migration
yarn build

WS_NODE_URL=ws://127.0.0.1:9944 \
IPFS_CLIENT_URL=http://localhost:5001 \
INDEXER_ENDPOINT_URL=http://127.0.0.1:4010/v1/graphql \
    node -r dotenv-expand/config \
    lib/processor/index.js \
    dotenv_config_debug=true
