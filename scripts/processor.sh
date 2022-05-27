#!/bin/sh

if [ "$1" = "--start" ]; then
    echo "Starting processor"
    yarn db:up && yarn redis:up && yarn db:reset && yarn db:migrate
elif [ "$1" = "--resume" ]; then
    echo "Resuming processor"
else
    echo "Please specify first argument with --start or --resume"
    exit
fi

if [ "$2" = "--local" ]; then
    yarn build && NODE_ENV=local node lib/processor/index.js
elif [ "$2" = "--test" ]; then
    yarn build && NODE_ENV=test node lib/processor/index.js
elif [ "$2" = "--m1" ]; then
    yarn build && NODE_ENV=m1 node lib/processor/index.js
elif [ "$2" = "--m2" ]; then
    yarn build && NODE_ENV=m2 node lib/processor/index.js
else
    echo "Please specify second argument with --local or --test"
fi