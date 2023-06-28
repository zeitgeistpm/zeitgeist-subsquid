/**
 * Script to subscribe to new market proposals
 * Run using `ts-node scripts/subscribe/marketStatus.ts wss://bsr.zeitgeist.pm <webhook-url>`
 */
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';
import axios from 'axios';
import { Market } from '../../src/model';
import { Db } from './db';

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
        const status = await postDiscordAlert(m[i]);
        if (status && status === 204) {
          await db.saveOrUpdateMarket(m[i].marketId, m[i].status);
        }
      }
    },
    error: (error) => {
      console.error(`Error while subscribing to query: ${error}`);
    },
    complete: () => {
      console.log('Subscription complete!');
    },
  }
);

const postDiscordAlert = async (market: Market): Promise<{ status: boolean; result: string }> => {
  if (!WEBHOOK_URL) return { status: false, result: `Web-hook url not found` };

  let color = `11584734`;
  let fields = [] as any;
  if (market.status === MarketStatus.Proposed) {
    color = `16766720`;
    fields = [
      {
        name: `Description`,
        value: market.description!.replace(/<[^>]+>/g, ``),
      },
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
      },
    ];
  }

  try {
    await axios.post(WEBHOOK_URL, {
      username: `Market ${market.status} Alert`,
      content: ``,
      embeds: [
        {
          color,
          title: market.question,
          url: `https://app.zeitgeist.pm/markets/${market.marketId}`,
          fields,
        },
      ],
    });
    return { status: true, result: `Successfully posted discord alert` };
  } catch (err) {
    log(JSON.stringify(err));
  } finally {
    return { status: false, result: `Error while posting discord alert` };
  }
};

const log = (message: string, marketObjID?: string) => {
  if (marketObjID) {
    console.log(`[${marketObjID}] ${message}`);
    return;
  }
  console.log(message);
};
