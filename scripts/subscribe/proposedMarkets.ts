/**
 * Script to subscribe to new market proposals
 * Run using `ts-node scripts/subscribe/proposedMarkets.ts wss://bsr.zeitgeist.pm <webhook-url>`
 */
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';
import axios, { AxiosResponse } from 'axios';
import Db from './db';
import { Market } from '../../src/model';

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
        markets(where: {status_eq: Proposed}) {
          description
          marketId
          marketType {
            categorical
            scalar
          }
          period {
            end
            start
          }
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
        const res = await postDiscordAlert(m[i]);
        if (res && res.status === 204) {
          await db.saveOrUpdateMarket(m[i].marketId, m[i].status);
        }
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

const postDiscordAlert = async (market: Market): Promise<AxiosResponse<any, any> | undefined> => {
  console.log(`Posting ${market.status} alert for marketId: ${market.marketId}`);
  try {
    const res = await axios.post(WEBHOOK_URL, {
      username: 'Market Proposed Alert',
      content: '',
      embeds: [
        {
          color: '16766720',
          title: market.question,
          url: `https://app.zeitgeist.pm/markets/${market.marketId}`,
          fields: [
            {
              name: 'Description',
              value: market.description!.replace(/<[^>]+>/g, ''),
            },
            {
              name: 'MarketType',
              value: market.marketType.categorical
                ? `Categorical : ${market.marketType.categorical}`
                : `Scalar : ${market.marketType.scalar}`,
            },
            {
              name: 'Period',
              value: `${new Date(+market.period.start.toString()).toUTCString()} - ${new Date(
                +market.period.end.toString()
              ).toUTCString()}`,
            },
          ],
        },
      ],
    });
    return res;
  } catch (err) {
    console.error(`Error while posting discord alert: ${err}`);
    return;
  }
};
