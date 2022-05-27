#!/bin/sh

# Control points of processor
if [ "$1" = "--start" ]; then
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
    yarn build && NODE_ENV=local node lib/processor/index.js
elif [ "$2" = "--dev" ]; then
    yarn build && NODE_ENV=dev node lib/processor/index.js
elif [ "$2" = "--t1" ]; then
    yarn build && NODE_ENV=t1 node lib/processor/index.js
elif [ "$2" = "--t2" ]; then
    yarn build && NODE_ENV=t2 node lib/processor/index.js
elif [ "$2" = "--m1" ]; then
    yarn build && NODE_ENV=m1 node lib/processor/index.js
elif [ "$2" = "--m2" ]; then
    yarn build && NODE_ENV=m2 node lib/processor/index.js
else
    echo "Please specify second argument with --local or --dev"
fi