# zeitgeist-subsquid

[Subsquid](https://www.subsquid.io/) is used to index and provides a graphql interface on top of Zeitgeist. 

Click [here](https://processor.zeitgeist.pm/graphql) to start querying on the data available with Zeitgeist.

Types are defined  in  `schema.graphql` file.

## Concept

The substrate events are processed in a multi-step pipeline:

    Zeitgeist Chain => Hydra Indexer => Indexer GraphQL gateway => Hydra Processor => Database => Query Node GraphQL endpoint

![Bird eye overview](https://docs.subsquid.io/~/files/v0/b/gitbook-28427.appspot.com/o/assets%2F-MdI-MAyz-csivC8mmdb%2Fsync%2Fe587479ff22ad79886861487b2734b6556302d10.png?generation=1624891459661016&alt=media)

## Prerequisites

* Node v14x
* Docker
* Docker compose (https://docs.docker.com/compose/install/)

## Scripts

```bash
# The dependencies setup
yarn install

# Run fresh development Zeitgeist PM node (accessible from
# ws://localhost:9944) from docker image and start indexing it
yarn indexer:start

# Start services needed for processor
yarn db:up && yarn redis:up

# Processor's database operations

# Create initial project's migration - removes everything under `db/migrations`
# folder if existing and creates initial migration
# Will reset database with db:reset
yarn db:create-migration

# Drop database
yarn db:drop

# Create database
yarn db:create

# Reset the processor database (db:drop and db:create scripts are ran sequentially)
yarn db:reset

# Run existing migrations onto database
yarn db:migrate

# Now you can start processing chain data
yarn processor:resume

# If `yarn indexer:start` is used for indexer, processor is started this way
# Will override following environment variables:
#  - WS_NODE_URL
#  - IPFS_CLIENT_URL
#  - INDEXER_ENDPOINT_URL
yarn processor:local:start

# Following will start services for processor, reset database, run migrations and start processor (testnet only)
yarn processor:start

# The above command will block
# Open a separate terminal and launch the graphql server to query the processed data
yarn query-node:start
```

## Project structure

Hydra tools expect a certain directory layout:

* `generated` - model/server definitions created by `codegen`. Do not alter the contents of this directory manually.
* `.env` - hydra tools are heavily driven by environment variables defined here or supplied by a shell.

## Important environment variables (.env file)

- WS_NODE_URL - Url of the Substrate node for indexing (default: wss://bsr.zeitgeist.pm).
- INDEXER_ENDPOINT_URL - Url for indexer graphql api to be processed (default: https://indexer.zeitgeist.pm/v1/graphql).
- IPFS_CLIENT_URL - Shouldn't be manually set most of the time. Used for development / local environment.

Those three environment variables are overridden when running `yarn processor:local:start` with urls for services provided by docker.

## Development flow

If you modified `schema.graphql`:

```bash
# Run codegen to re-generate model/server files
yarn codegen

# Analyze database state and create a new migration to match generated models
yarn db:create-migration # add -n "myName" to skip the migration name prompt

# Apply the migrations
yarn db:migrate
```

You might want update the `Initial` migration instead of creating a new one (e.g. during the development phase when the production database is not yet set up). In that case it is convenient to reset the database schema and start afresh:

```bash
yarn db:reset
yarn db:create-migration
yarn db:migrate
```

To generate new type definitions for chain events and extrinsics:

```bash
# Review typegen section of manifest.yml (https://docs.subsquid.io/hydra-typegen)

# Delete old definitions
rm -rf chain

# Run typegen tool
yarn typegen
```

## Configuration

Project's configuration is driven by environment variables, defined in `.env`,
and `manifest.yml`. For more details see https://docs.subsquid.io.

## Indexer

Running an indexer is required. The indexer can be found in the [indexer folder](./indexer).

It is recommended to use already set up indexer if available, as new indexer typically
requires some time to catch up with interesting events.

Have a look at `./indexer/docker-compose.yml` for example of how you can set up a self-hosted version.
