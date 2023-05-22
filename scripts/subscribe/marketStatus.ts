/**
 * Script to subscribe to new market proposals
 * Run using `ts-node scripts/subscribe/marketStatus.ts wss://bsr.zeitgeist.pm <webhook-url>`
 */
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';
import axios from 'axios';
import { Market } from '../../src/model';
import Db from './db';

const NODE_URL = process.argv[2];
const WEBHOOK_URL = process.argv[3];
const GRAPHQL_WS_URL = NODE_URL.includes(`bs`)
  ? `wss://processor.bsr.zeitgeist.pm/graphql`
  : `wss://processor.rpc-0.zeitgeist.pm/graphql`;
const CACHE_DB_PATH = `subscribe-db.db`;

const client = createClient({ webSocketImpl: WebSocket, url: GRAPHQL_WS_URL });
const db = new Db(CACHE_DB_PATH);

client.subscribe(
  {
    query: `
      subscription {
        markets(where: {status_in: [Closed, Reported, Disputed, Resolved]}) {
          marketId
          question
          status
        }
      }  
    `,
  },
  {
    next: async ({ data }) => {
      const { markets } = data as any;
      const m = markets as Market[];
      for (let i = 0; i < m.length; i++) {
        const entry = await db.getMarketWithId(m[i].marketId);
        if (entry && entry.status === m[i].status) continue;
        postDiscordAlert(m[i]);
        await db.saveOrUpdateMarket(m[i].marketId, m[i].status);
      }
    },
    error: (error) => {
      console.error('error', error);
    },
    complete: () => {
      console.log('done!');
    },
  }
);

const postDiscordAlert = async (market: Market) => {
  console.log(`Posting ${market.status} alert for marketId: ${market.marketId}`);
  await axios.post(WEBHOOK_URL, {
    username: `Market ${market.status} Alert`,
    content: '',
    embeds: [
      {
        color: '11584734',
        title: market.question,
        url: `https://app.zeitgeist.pm/markets/${market.marketId}`,
      },
    ],
  });
};
