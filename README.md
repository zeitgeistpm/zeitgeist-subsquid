[Subsquid](https://www.subsquid.io/) is used to index, process and query on top of Zeitgeist.


## Zeitgeist's Self-Hosted Squids

* Dev Processor: https://processor.zeitgeist.pm/graphql
* Testnet Processor: https://processor.bsr.zeitgeist.pm/graphql
* Mainnet Processor: https://processor.rpc-0.zeitgeist.pm/graphql


## Concept

The substrate events are processed in a multi-step pipeline:

    Zeitgeist Chain => Subsquid Archive => Archive GraphQL Gateway => Subsquid Processor => Query Node API


## Prerequisites

* Node 16.x
* Docker


## Quick Run

```bash
# The dependencies setup
yarn install --frozen-lockfile
```

### Using local node (ws://localhost:9944)

```bash
# For mac users
yarn squid:mac:start

# For non-mac users
yarn squid:start
```

### Using testnet node (wss://bsr.zeitgeist.pm)

#### 1. Start processor services

```bash
yarn db:up
```

#### 2. Compile processor code

```bash
yarn build
```

#### 3. Run existing migrations onto database

```bash
yarn migration:apply
```

#### 5. Start processing test chain data

```bash
REDIS_HOST=localhost DB_HOST=localhost NODE_ENV=test node lib/processor.js
```

#### 6. Open a separate terminal and launch the graphql server to query the processed data

```bash
yarn api:start
```


## Project Structure

Subsquid tools expect a certain directory layout:

* `src/generated` - model/server definitions created by `codegen`. Do not alter the contents of this directory manually.
* `src/server-extension` - module with custom `type-graphql` based resolvers
* `src/types` - data type definitions for chain events and extrinsics created by `typegen`.
* `src/mappings` - mapping module.
* `lib` - compiled js files. The structure of this directory must reflect `src`.
  

## Scripts

```bash
# Stop query-node
yarn api:stop

# Index data from local node
yarn archive:start

# Stop local indexer
yarn archive:stop

# Generate necessary entity classes based on definitions at schema.graphql
yarn codegen

# Stop local processor services
yarn db:down

# Generate migration to match the target schema
# The target schema is derived from entity classes generated earlier
yarn migration:generate

# Revert the last performed migration
yarn migration:revert

# Stop local processor
yarn processor:stop

# Stop local subsquid running on docker
yarn squid:stop

# Generate types for events defined at typegen.json
yarn typegen
```


## Misc

For more details, please check out https://docs.zeitgeist.pm & https://docs.subsquid.io.