[Subsquid](https://www.subsquid.io/) is used to index, process and query on top of Zeitgeist.


## Zeitgeist's Self-Hosted Squids

* Dev Processor: https://processor.zeitgeist.pm/graphql
* Testnet Processor: https://processor.bsr.zeitgeist.pm/graphql
* Mainnet Processor: https://processor.rpc-0.zeitgeist.pm/graphql


## Concept

The substrate events are processed in a multi-step pipeline:

    Zeitgeist Chain => Subsquid Archive => Archive GraphQL Gateway => Subsquid Processor => Query Node API


## Prerequisites

* Node 20.x
* Docker


## Quick Run

```bash
# 1. The dependencies setup
yarn install --frozen-lockfile

# 2. Init and start services
yarn spin

# 3. Launch GraphQl API
yarn api:start
```


## Project Structure

Subsquid tools expect a certain directory layout:

* `src/mappings` - handlers for events and calls.
* `src/model` - model/server definitions created by `codegen`. Do not alter the contents of this directory manually.
* `src/post-hooks` - manual injection of data for missing events on testnet during early stages.
* `src/server-extension` - module with custom `type-graphql` based resolvers
* `src/types` - data type definitions for chain events and extrinsics created by `typegen`.
  

## Scripts

```bash
# Stop query-node
yarn api:stop

# Compile processor code
yarn build

# Generate necessary entity classes based on definitions at schema.graphql
yarn codegen

# Start processor services
yarn db:up

# Stop processor services
yarn db:down

# Run existing migrations onto database
yarn migration:apply

# Generate migration to match the target schema
# The target schema is derived from entity classes generated using codegen
yarn migration:generate

# Revert the last performed migration
yarn migration:revert

# Start processor
yarn processor:start

# Stop processor
yarn processor:stop

# Generate types for events defined at typegen.json
yarn typegen
```


## Misc

For more details, please check out https://docs.zeitgeist.pm & https://docs.subsquid.io.