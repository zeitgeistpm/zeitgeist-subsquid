FROM node:20-alpine AS base

# Stage for packages requiring build tools
FROM base AS node-with-gyp
RUN apk add g++ make python3

# Build stage
FROM node-with-gyp AS builder
WORKDIR /indexer
COPY package.json yarn.lock ./
RUN yarn install
COPY tsconfig.json ./
COPY src ./src
RUN yarn build

# Dependencies stage
FROM node-with-gyp AS deps
WORKDIR /indexer
COPY package.json yarn.lock ./
RUN yarn install

# Main application stage
FROM base AS indexer
WORKDIR /indexer
COPY --from=deps /indexer/package.json /indexer/yarn.lock ./
COPY --from=deps /indexer/node_modules ./node_modules
COPY --from=builder /indexer/lib ./lib
COPY db ./db
COPY schema.graphql ./
CMD ["yarn", "indexer:up"]

# API application stage
FROM indexer AS api
CMD ["yarn", "api:start"]