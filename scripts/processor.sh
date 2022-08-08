#!/bin/sh

# Control points of processor
if [ "$1" = "--start" ]; then
    docker build . --target processor -t zeitgeist-processor
    echo "Starting processor"
    yarn db:up && yarn redis:up && yarn db:reset && yarn db:migrate
elif [ "$1" = "--resume" ]; then
    echo "Resuming processor"
else
    echo "Please specify first argument with --start or --resume"
    exit
fi

# Process data from local-network or battery-station or main-net by passing below argument
if [ "$2" = "--local" ]; then
    docker run --rm -e NODE_ENV=local --env-file=.env.local -d zeitgeist-processor
elif [ "$2" = "--dev" ]; then
    docker run --rm -e NODE_ENV=dev --env-file=.env.dev -d zeitgeist-processor
elif [ "$2" = "--t1" ]; then
    docker run --rm -e NODE_ENV=t1 --env-file=.env.t1 -d zeitgeist-processor
elif [ "$2" = "--t2" ]; then
    docker run --rm -e NODE_ENV=t2 --env-file=.env.t2 -d zeitgeist-processor
elif [ "$2" = "--m1" ]; then
    docker run --rm -e NODE_ENV=m1 --env-file=.env.m1 -d zeitgeist-processor
elif [ "$2" = "--m2" ]; then
    docker run --rm -e NODE_ENV=m2 --env-file=.env.m2 -d zeitgeist-processor
else
    echo "Please specify second argument with --local or --dev"
fi