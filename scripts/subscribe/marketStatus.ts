/**
 * Script to subscribe to new market proposals
 * Run using `ts-node scripts/subscribe/marketStatus.ts wss://bsr.zeitgeist.pm <webhook-url>`
 */
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';
import axios from 'axios';
import { Market, MarketStatus } from '../../src/model';
import { StatusDb } from './db';

const NODE_URL = process.argv[2];
const WEBHOOK_URL = process.argv[3];
const GRAPHQL_WS_URL = NODE_URL.includes(`bs`)
  ? `wss://processor.bsr.zeitgeist.pm/graphql`
  : `wss://processor.rpc-0.zeitgeist.pm/graphql`;
const LOG_DB_PATH = NODE_URL.includes(`bs`) ? `marketStatus-testnet.db` : `marketStatus-mainnet.db`;
const DOMAIN_PREFIX = NODE_URL.includes(`bs`) ? `test.staging` : `app`;

const client = createClient({ webSocketImpl: WebSocket, url: GRAPHQL_WS_URL });
const db = new StatusDb(LOG_DB_PATH);

client.subscribe(
  {
    query: `
      subscription {
        markets(where: {status_in: [Proposed, Active, Closed, Reported, Disputed, Resolved]}, orderBy: marketId_DESC) {
          id
          description
          marketId
          marketType {
            categorical
            scalar
          }
          period {
            start
            end
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
        // Skip the market if its status is already logged
        const entry = await db.getMarketWithId(m[i].marketId);
        if (entry && entry.status === m[i].status) continue;

        log(`--> Captured ${m[i].status} status on marketId:${m[i].marketId}`);
        const res = await postDiscordAlert(m[i]);
        log(res.result, m[i].id);
        if (res.status) {
          await db.saveOrUpdateMarket(m[i].marketId, m[i].status);
        }
      }
    },
    error: (error) => {
      log(`Error while subscribing to query: ${JSON.stringify(error)}`);
    },
    complete: () => {
      log(`Subscription complete`);
    },
  }
);

const postDiscordAlert = async (market: Market): Promise<{ status: boolean; result: string }> => {
  if (!WEBHOOK_URL) return { status: false, result: `Web-hook url not found` };
  if (!market.question) return { status: true, result: `Market's question not found` };

  let color = `11584734`;
  let fields = [] as any;
  if (market.status === MarketStatus.Proposed) {
    color = `16766720`;
    if (market.description) {
      fields.push({
        name: `Description`,
        value: market.description.replace(/<[^>]+>/g, ``),
      });
    }
    fields.push(
      {
        name: `MarketType`,
        value: market.marketType.categorical
          ? `Categorical : ${market.marketType.categorical}`
          : `Scalar : ${market.marketType.scalar}`,
      },
      {
        name: `Period`,
        value: `${new Date(+market.period.start.toString()).toUTCString()} - ${new Date(
          +market.period.end.toString()
        ).toUTCString()}`,
      }
    );
  }

  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const res = await axios.post(WEBHOOK_URL, {
          username: `Market ${market.status} Alert`,
          embeds: [
            {
              color,
              title: market.question,
              url: `https://${DOMAIN_PREFIX}.zeitgeist.pm/markets/${market.marketId}`,
              fields,
            },
          ],
        });
        resolve({ status: true, result: `Successfully posted discord alert with status ${res.status}` });
      } catch (err) {
        log(JSON.stringify(err));
        resolve({ status: false, result: `Error while posting discord alert` });
      }
    }, 5000);
  });
};

const log = (message: string, marketObjID?: string) => {
  if (marketObjID) {
    console.log(`[${marketObjID}] ${message}`);
    return;
  }
  console.log(message);
};
