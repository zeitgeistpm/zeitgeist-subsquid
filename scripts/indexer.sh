#!/bin/sh
cd indexer && docker-compose down --remove-orphans

# Index data from local-network or battery-station or main-net by passing below argument
# Details are specified in docker-compose*.yml files in indexer directory
if [ "$1" = "-local" ]; then 
    docker-compose -f ./docker-compose.yml -f ./docker-compose.local.yml up -d
elif [ "$1" = "-testnet" ]; then
    docker-compose -f ./docker-compose.yml -f ./docker-compose.testnet.yml up -d
elif [ "$1" = "-mainnet" ]; then
    docker-compose -f ./docker-compose.yml -f ./docker-compose.mainnet.yml up -d
else
    echo "Please specify -local or -testnet or -mainnet"
fi
