[Subsquid](https://www.subsquid.io/) is used to index and provide a graphql interface on top of Zeitgeist.
Types are defined  in  `schema.graphql` file.


## Zeitgeist's Self-Hosted Squids
* Dev Processor: https://processor.zeitgeist.pm/graphql
* Testnet Processor: https://processor.bsr.zeitgeist.pm/graphql
* Mainnet Processor: https://processor.rpc-0.zeitgeist.pm/graphql


## Concept

The substrate events are processed in a multi-step pipeline:

    Zeitgeist Chain => Subsquid Archive => Archive GraphQL gateway => Subsquid Processor => Database => Query Node GraphQL endpoint


## Prerequisites

* Node 16.x
* Docker

## Scripts

```bash
# The dependencies setup
yarn install --frozen-lockfile

# Run fresh development Zeitgeist PM node (accessible from
# ws://localhost:9944) from docker image and start all subsquid resources
For Mac users: yarn squid:mac:start
For Non-mac users: yarn squid:start

# Stop local subsquid docker resources
yarn squid:stop

# Commands to run testnet processor locally without docker

# Start processor db and redis cache db
yarn db:up

# Compile processor code
yarn build

# Processor's database operations

# Removes all existing migrations under `db/migrations` folde
rm -r db/migrations

# Creates initial migration
yarn migration:create

# Drop database
yarn db:down

# Run existing migrations onto database
yarn migration:apply

# Now you can start processing test chain data
REDIS_HOST=localhost DB_HOST=localhost NODE_ENV=test node lib/processor.js

# Open a separate terminal and launch the graphql server to query the processed data
yarn api:start

# Stop query-node
yarn api:stop
```

## Project Structure

Subsquid tools expect a certain directory layout:

* `generated` - model/generated definitions created by `yarn codegen`. Do not alter the contents of this directory manually.

## Important Environment Variables (.env file)

- WS_NODE_URL - Url of the Substrate node for indexing (default: wss://bsr.zeitgeist.pm).
- INDEXER_ENDPOINT_URL - Url for indexer graphql api to be processed (default: https://indexer.zeitgeist.pm/v1/graphql).
- IPFS_CLIENT_URL - Shouldn't be manually set most of the time. Used for development / local environment.

Those three environment variables are overriden when running `yarn processor:local:start` with urls for services provided by docker.

## Development Flow

If you modified `schema.graphql`:

```bash
# Run codegen to re-generate model/server files
yarn codegen

# Analyze database state and create a new migration to match generated models
yarn db:create-migration # add -n "myName" to skip the migration name prompt

# Apply the migrations
yarn db:migrate
```

You might want update the `Initial` migration instead of creating a new one (e.g. during the development phase when the production database is not yet set up). In that case it convenient to reset the database schema and start afresh:

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

It is recommeded to use already set up indexer if available, as new indexer typically
requires some time to catch up with interesting events.

Have a look at `./indexer/docker-compose.yml` for example of how you can set up a self-hosted version.