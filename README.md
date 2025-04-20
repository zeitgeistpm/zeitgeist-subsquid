# Zeitgeist Subsquid Indexer

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
yarn indexer:start:local

# 3. Launch GraphQl API
yarn api:start
```

## Environment Setup

### Environment Configuration
The indexer supports three environments:
- **local**: For development with ephemeral storage
- **test**: For testnet deployment with persistent storage
- **main**: For mainnet deployment with persistent storage

### Required Environment Variables
Create the following `.env` files:

```text:.env.local
# Local development variables
DB_PORT=5432
```

```text:.env.test
# Testnet deployment variables
DB_PORT=5432
DB_PATH=/mnt/ztg-indexer-*
```

```text:.env.main
# Mainnet deployment variables 
DB_PORT=5432
DB_PATH=/mnt/ztg-indexer-*
```

### Docker Compose Configuration
We use environment-specific Docker Compose files:

- `docker-compose.yml`: Base configuration
- `docker-compose.override.yml`: Local development overrides (non-persistent storage)

## Installation & Local Development

### Setup for Local Development
```bash
# 1. Install dependencies
yarn install --frozen-lockfile

# 2. Start local environment (non-persistent database)
yarn indexer:start:local

# 3. Apply migrations
yarn migration:apply

# 4. Generate code from schema
yarn codegen

# 5. Build the processor
yarn build

# 6. Start the API server
yarn api:start
```

### Working with Local Changes
```bash
# Rebuild and restart with your changes 
yarn indexer:rebuild:local

# If you modified the schema
yarn codegen && yarn migration:generate && yarn migration:apply
```

## Database Management

### Non-Persistent Storage (Local Development)
For local development, we use a tmpfs volume that doesn't persist data:

```yaml:docker-compose.override.yml
services:
  db:
    volumes:
      - postgres-temp-data:/var/lib/postgresql/data

volumes:
  postgres-temp-data:
```

### Persistent Storage (Test/Main)
For test and main environments, data is stored in a persistent volume:

```yaml:docker-compose.prod.yml
services:
  db:
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ${DB_PATH}
```

### Database Backup and Restore
```bash
# Backup database
docker exec db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql

# Restore database
cat backup_file.sql | docker exec -i db psql -U postgres postgres
```

## Deployment Guide

### Production Deployment Steps

1. **Prepare the server**:
   ```bash
   # Create data directory
   sudo mkdir -p /mnt/ztg-indexer-*
   sudo chmod 777 /mnt/ztg-indexer-*
   ```

2. **Clone and set up the repository**:
   ```bash
   git clone https://github.com/zeitgeistpm/zeitgeist-subsquid.git
   cd zeitgeist-subsquid
   yarn install --frozen-lockfile
   ```

3. **Start the production environment**:
   ```bash
   # For mainnet
   yarn indexer:start:main
   
   # For testnet
   yarn indexer:start:test
   ```

4. **Apply migrations and start services**:
   ```bash
   yarn migration:apply
   yarn api:start
   ```

### Updating Deployed Services
```bash
# Pull latest changes
git pull

# Rebuild and restart services
yarn build
yarn indexer:rebuild:main  # or indexer:rebuild:test for testnet
```

## Maintenance & Operations

### Health Checks
```bash
# Check if containers are running
docker ps

# Check application logs
docker logs processor
docker logs api

# Test GraphQL endpoint
curl -X POST -H "Content-Type: application/json" \
  --data '{"query": "{_metadata{lastProcessedHeight}}"}' \
  http://localhost:4000/graphql
```

### Volume Management
```bash
# List Docker volumes
docker volume ls

# Clean up unused volumes
docker volume prune

# Remove specific volumes (use with caution)
docker volume rm zeitgeist-subsquid_db-data
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

# Run existing migrations onto database
yarn migration:apply

# Generate migration to match the target schema
# The target schema is derived from entity classes generated using codegen
yarn migration:generate

# Revert the last performed migration
yarn migration:revert

# Start indexer services
yarn indexer:start:local   # For local development (ephemeral DB)
yarn indexer:start:test    # For testnet deployment
yarn indexer:start:main    # For mainnet deployment

# Rebuild and restart services
yarn indexer:rebuild:local # Rebuild for local environment
yarn indexer:rebuild:test  # Rebuild for testnet environment
yarn indexer:rebuild:main  # Rebuild for mainnet environment

# Generate types for events defined at typegen.json
yarn typegen
```

## Additional Resources

For more details, please check out:
- [Zeitgeist Documentation](https://docs.zeitgeist.pm)
- [Subsquid Documentation](https://docs.subsquid.io)