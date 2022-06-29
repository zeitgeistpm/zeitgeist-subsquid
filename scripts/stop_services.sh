#!/bin/sh

# to start fresh docker containers for indexer, run this commands
docker-compose down
cd indexer && docker-compose -f docker-compose.yml -f docker-compose.local.yml down
docker container prune