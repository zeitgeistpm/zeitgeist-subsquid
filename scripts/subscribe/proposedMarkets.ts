import { Market } from '../../src/model';
import WebSocket from 'ws';
import { createClient } from 'graphql-ws';
import axios from 'axios';

const client = createClient({
  webSocketImpl: WebSocket,
  url: `ws://localhost:4350/graphql`,
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
      postMessage(markets[0]);
    },
    error: (error) => {
      console.error('error', error);
    },
    complete: () => {
      console.log('done!');
    },
  }
);

const postMessage = async (market: Market) => {
  if (!market.description) return;
  const res = await axios.post(process.env.DISCORD_WEBHOOK_URL!, {
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
            value: market.description.replace(/<[^>]+>/g, ''),
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
  console.log(res);
};
