/**
 * Script to subscribe to new market proposals
 * Run using `ts-node scripts/subscribe/proposedMarkets.ts wss://bsr.zeitgeist.pm <webhook-url>`
 */
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';
import axios from 'axios';
import { Market } from '../../src/model';

const NODE_URL = process.argv[2];
const WEBHOOK_URL = process.argv[3];
const GRAPHQL_WS_URL = NODE_URL.includes(`bs`)
  ? `wss://processor.bsr.zeitgeist.pm/graphql`
  : `wss://processor.rpc-0.zeitgeist.pm/graphql`;

const client = createClient({
  webSocketImpl: WebSocket,
  url: GRAPHQL_WS_URL,
});

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
        }  
      }  
    `,
  },
  {
    next: ({ data }) => {
      const { markets } = data as any;
      if (markets.length > 0) {
        postDiscordAlert(markets[0]);
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
  console.log(market);
  await axios.post(WEBHOOK_URL, {
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
};
