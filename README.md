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
* Docker Compose

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
Create the following `.env` files with **all required variables**:

```text:.env.local
# Local development variables
DB_PORT=5432
REDIS_PASS=redis
```

```text:.env.test
# Testnet deployment variables
DB_PORT=5432
DB_PATH=/mnt/ztg-indexer-test
CACHE_PATH=/mnt/ztg-cache-test
REDIS_PASS=redis
BATCH_SIZE=100
BLOCK_WINDOW=100000
GRAPHQL_SERVER_PORT=4000
GRAPHQL_SERVER_HOST=localhost
WARTHOG_SUBSCRIPTIONS=true
GQL_PORT=4350
NODE_ENV=test
```

```text:.env.main
# Mainnet deployment variables 
DB_PORT=5432
DB_PATH=/mnt/ztg-indexer-main
CACHE_PATH=/mnt/ztg-cache-main
REDIS_PASS=redis
BATCH_SIZE=100
BLOCK_WINDOW=100000
GRAPHQL_SERVER_PORT=4000
GRAPHQL_SERVER_HOST=localhost
WARTHOG_SUBSCRIPTIONS=true
GQL_PORT=4350
NODE_ENV=main
```

**⚠️ Important**: Make sure all environment variables are set in your `.env` files. Missing variables like `REDIS_PASS`, `DB_PATH`, or `CACHE_PATH` will cause containers to fail.

### Docker Compose Configuration
We use environment-specific Docker Compose files:

- `docker-compose.yml`: Base configuration
- `docker-compose.override.yml`: Local development overrides (non-persistent storage)

## Installation & Local Development

### Setup for Local Development
```bash
# 1. Install dependencies
yarn install --frozen-lockfile

# 2. Create .env.local file (see Environment Variables section above)
# Make sure to include REDIS_PASS

# 3. Start local environment (non-persistent database)
yarn indexer:start:local

# 4. Apply migrations
yarn migration:apply

# 5. Generate code from schema
yarn codegen

# 6. Build the processor
yarn build

# 7. Start the API server
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
   # Create data directories
   # Replace * with main on mainnet or test on testnet
   sudo mkdir -p /mnt/ztg-indexer-*
   sudo mkdir -p /mnt/ztg-cache-*
   sudo chmod 777 /mnt/ztg-indexer-*
   sudo chmod 777 /mnt/ztg-cache-*
   ```

2. **Clone and set up the repository**:
   ```bash
   git clone https://github.com/zeitgeistpm/zeitgeist-subsquid.git
   cd zeitgeist-subsquid
   yarn install --frozen-lockfile
   ```

3. **Create environment file**:
   ```bash
   # Create .env.main with all required variables (see Environment Variables section)
   # Ensure DB_PATH, CACHE_PATH, REDIS_PASS, and other variables are set
   ```

4. **Start the production environment**:
   ```bash
   # For mainnet - use explicit env file to ensure variables are loaded
   docker-compose --env-file .env.main up -d
   
   # For testnet
   docker-compose --env-file .env.test up -d
   
   # Alternative: Create symlink for automatic loading
   ln -sf .env.main .env
   docker-compose up -d
   ```

5. **Apply migrations and start services**:
   ```bash
   # Wait for database to initialize, then apply migrations
   yarn migration:apply
   yarn codegen
   yarn build
   
   # Start API services
   ./scripts/deploy/api.sh main start  # for mainnet
   # or
   ./scripts/deploy/api.sh test start  # for testnet
   ```

### Troubleshooting Deployment

**If containers fail to start:**

1. **Check environment variables are loaded**:
   ```bash
   # Verify configuration is correct
   docker-compose --env-file .env.main config
   ```

2. **Check container logs**:
   ```bash
   # Check all container logs
   docker-compose logs
   
   # Check specific container
   docker logs db
   docker logs indexer
   ```

3. **Common issues**:
   - **Database fails with "directory not empty"**: Clear the database directory
     ```bash
     sudo rm -rf /mnt/ztg-indexer-main/*
     docker-compose down && docker-compose --env-file .env.main up -d
     ```
   - **Missing environment variables**: Ensure all variables are set in `.env` file
   - **Permission issues**: Ensure data directories have correct permissions (`chmod 777`)

### Updating Deployed Services
```bash
# Pull latest changes
git pull

# Rebuild and restart services
yarn build
docker-compose --env-file .env.main down
docker-compose --env-file .env.main up -d --build

# Or using yarn scripts
yarn indexer:rebuild:main  # or indexer:rebuild:test for testnet
```

## Maintenance & Operations

### Health Checks
```bash
# Check if containers are running
docker ps

# Check application logs
docker logs indexer
docker logs api
docker logs db

# Test GraphQL endpoint (note: API typically runs on port 4350)
curl -X POST -H "Content-Type: application/json" \
  --data '{"query": "{ __schema { types { name } } }"}' \
  http://localhost:4350/graphql
```

### API Endpoints
After successful deployment, your APIs will be available at:
- **Main GraphQL API**: `http://localhost:4350/graphql`
- **Subscription API**: `http://localhost:4000/graphql`
- **GraphQL Playground**: `http://localhost:4350/graphql` (interactive browser interface)

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

# Start indexer service
yarn indexer:start:local   # For local development (ephemeral DB)
yarn indexer:start:test    # For testnet deployment
yarn indexer:start:main    # For mainnet deployment

# Rebuild and restart service
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

+![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/zeitgeistpm/zeitgeist-subsquid?utm_source=oss&utm_medium=github&utm_campaign=zeitgeistpm%2Fzeitgeist-subsquid&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)