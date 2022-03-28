#!/bin/sh

cd ./zeitgeist-subsquid

docker-compose up -d

yarn db:create-migration
yarn build

# using .env file for environment variables
node -r dotenv/config \
    lib/processor/index.js \
    dotenv_config_debug=true
