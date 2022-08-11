#!/bin/sh
cd indexer

# Control points of indexer
if [ "$2" = "up" ]; then
  cmd="up -d"
else
  cmd=$2
fi

# Index data from local-network or battery-station or main-net by passing below argument
# Details are specified in docker-compose*.yml files in indexer directory
if [ "$1" = "local" ]; then 
  docker-compose -f ./docker-compose.yml -f ./docker-compose.local.yml $cmd
elif [ "$1" = "testnet" ]; then
  docker-compose -f ./docker-compose.yml -f ./docker-compose.testnet.yml $cmd
elif [ "$1" = "mainnet" ]; then
  docker-compose -f ./docker-compose.yml -f ./docker-compose.mainnet.yml $cmd
else
  echo "First argument should be `local` or `testnet` or `mainnet`"
fi
