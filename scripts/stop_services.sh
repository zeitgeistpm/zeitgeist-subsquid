#!/bin/sh

docker-compose down

cd indexer && docker-compose down

docker container prune