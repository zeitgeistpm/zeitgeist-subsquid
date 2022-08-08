FROM node:16-alpine AS node

FROM node AS node-with-gyp
RUN apk add g++ make python3

FROM node-with-gyp AS builder
WORKDIR /home/zeitgeist-squid
ADD package.json .
ADD yarn.lock .
RUN yarn install --frozen-lockfile
ADD tsconfig.json .
ADD src src
RUN npm run build

FROM node-with-gyp AS deps
WORKDIR /home/zeitgeist-squid
ADD package.json .
ADD yarn.lock .
RUN yarn install --frozen-lockfile

FROM node AS squid
WORKDIR /home/zeitgeist-squid
COPY --from=deps /home/zeitgeist-squid/package.json .
COPY --from=deps /home/zeitgeist-squid/yarn.lock .
COPY --from=deps /home/zeitgeist-squid/node_modules node_modules
COPY --from=builder /home/zeitgeist-squid/lib lib
ADD db db
ADD schema.graphql .
ADD zeitgeist.json .

EXPOSE 3000
EXPOSE 4000


FROM squid AS processor
CMD ["node", "lib/processor/index.js"]


FROM squid AS query-node
CMD ["npm", "run", "query-node:start"]