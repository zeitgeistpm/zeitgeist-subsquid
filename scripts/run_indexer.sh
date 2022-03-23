#!/bin/sh

# in case the following is given as a first option, run node in docker container and use for indexer
# details are specified in docker-compose*.yml files in indexer directory
# without this cli option testnet node will be used
if [ "$1" = "--with-local-node" ]; then 
    docker-compose -f ./indexer/docker-compose.yml -f ./indexer/docker-compose.local.yml up -d
else
    docker-compose -f ./indexer/docker-compose.yml -f ./indexer/docker-compose.testnet.yml up -d
fi
