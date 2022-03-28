#!/bin/sh

# to start fresh docker containers for indexer, run this commands
docker-compose down
cd indexer && docker-compose down
docker container prune