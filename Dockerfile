FROM node:20-alpine AS base

# Stage for packages requiring build tools
FROM base AS node-with-gyp
RUN apk add g++ make python3

# Build stage
FROM node-with-gyp AS builder
WORKDIR /indexer
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN yarn build

# Dependencies stage
FROM node-with-gyp AS deps
WORKDIR /indexer
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Unified application stage (replaces separate indexer/api stages)
FROM base AS unified
WORKDIR /indexer
COPY --from=deps /indexer/package.json /indexer/yarn.lock ./
COPY --from=deps /indexer/node_modules ./node_modules
COPY --from=builder /indexer/lib ./lib
COPY db ./db
COPY schema.graphql ./

# Set unified default command that works for both environments
CMD ["yarn", "run", "indexer:up"]