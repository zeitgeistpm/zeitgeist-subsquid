#!/bin/sh

# in case --local-node is given as a first option run node in docker container and use for indexer
if [ "$1" = "--with-local-node" ]; then 
    docker-compose -f ./indexer/docker-compose.yml -f ./indexer/docker-compose.local.yml up -d
else
    docker-compose -f ./indexer/docker-compose.yml -f ./indexer/docker-compose.testnet.yml up -d
fi
