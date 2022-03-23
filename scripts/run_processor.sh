#!/bin/sh

cd ./zeitgeist-subsquid

docker-compose up -d

yarn db:drop && yarn db:create && yarn db:migrate
yarn build

node -r dotenv/config \
    lib/processor/index.js \
    dotenv_config_debug=true
