import { HistoricalAccountBalance } from '../model';
import { _Asset } from '../consts';
import { PostHookBalance } from '.';

export const unreserveBalances = async (blockHeight: number): Promise<HistoricalAccountBalance[]> => {
  const habs: HistoricalAccountBalance[] = [];

  await Promise.all(
    unreservedBalances
      .filter((ub) => {
        return ub.blockHeight === blockHeight;
      })
      .map(async (ub: PostHookBalance) => {
        const hab = new HistoricalAccountBalance({
          accountId: ub.accountId,
          assetId: _Asset.Ztg,
          blockNumber: ub.blockHeight,
          dBalance: ub.amount,
          event: 'Unreserved',
          id: ub.eventId + '-' + ub.accountId.slice(-5),
          timestamp: new Date(ub.blockTimestamp!),
        });
        habs.push(hab);
      })
  );
  return habs;
};

const unreservedBalances: PostHookBalance[] = [
  {
    accountId: 'dDzCbtpYLKGKgV3xmuAbQdGNs6puwev2ZpbVP1L5VYSd2uF1Y',
    amount: BigInt(5 * 10 ** 10),
    blockHeight: 92128,
    blockTimestamp: '2021-10-21T16:00:30.057000Z',
    eventId: '0000092128-000000-1e9d6',
  },
  {
    accountId: 'dE1EyDwADmoUReAUN2ynVgvGmqkmaWj3Ht1hMndubRPY4NrjD',
    amount: BigInt(5 * 10 ** 9),
    blockHeight: 108949,
    blockTimestamp: '2021-10-24T00:26:18.120000Z',
    eventId: '0000108949-000000-3263e',
  },
  {
    accountId: 'dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW',
    amount: BigInt(5 * 10 ** 9),
    blockHeight: 155917,
    blockTimestamp: '2021-10-31T13:35:36.691000Z',
    eventId: '0000155917-000000-3f61f',
  },
  {
    accountId: 'dE3EP2kkLee2E22JJr8kSEnXkQ1VyAoB8YnQsxgE5BFLMHGDj',
    amount: BigInt(7 * 10 ** 10),
    blockHeight: 168378,
    blockTimestamp: '2021-11-02T08:49:18.097000Z',
    eventId: '0000168378-000000-e544d',
  },
  {
    accountId: 'dE1qpHWYrzYSz5x2hkUtb9JW3iSEzE5igqcNR1XEcczWi5n8k',
    amount: BigInt(7 * 10 ** 10),
    blockHeight: 168378,
    blockTimestamp: '2021-11-02T08:49:18.097000Z',
    eventId: '0000168378-000000-e544d',
  },
  {
    accountId: 'dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW',
    amount: BigInt(5 * 10 ** 10),
    blockHeight: 175178,
    blockTimestamp: '2021-11-03T07:40:18.096000Z',
    eventId: '0000175178-000000-df5fd',
  },
  {
    accountId: 'dDzJBHBMDk2WhoaRxPhXnf4EqdkE8aRDWR15epsT4Hd6ufakp',
    amount: BigInt(5 * 10 ** 9),
    blockHeight: 176408,
    blockTimestamp: '2021-11-03T11:47:42.116000Z',
    eventId: '0000176408-000000-6059b',
  },
  {
    accountId: 'dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW',
    amount: BigInt(5 * 10 ** 10),
    blockHeight: 178290,
    blockTimestamp: '2021-11-03T18:06:00.103000Z',
    eventId: '0000178290-000000-58224',
  },
  {
    accountId: 'dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW',
    amount: BigInt(5 * 10 ** 10),
    blockHeight: 179524,
    blockTimestamp: '2021-11-03T22:14:12.127000Z',
    eventId: '0000179524-000000-79a82',
  },
  {
    accountId: 'dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW',
    amount: BigInt(5 * 10 ** 10),
    blockHeight: 184820,
    blockTimestamp: '2021-11-04T15:57:18.097000Z',
    eventId: '0000184820-000000-d843f',
  },
  {
    accountId: 'dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW',
    amount: BigInt(8.25 * 10 ** 10),
    blockHeight: 204361,
    blockTimestamp: '2021-12-10T16:26:42.078000Z',
    eventId: '0000204361-000000-e6cc2',
  },
  {
    accountId: 'dDzFGnwpyB9bWPsd9RoxZA6mW4MDNRVHvCFgnqhhE2f5yVJ8v',
    amount: BigInt(8.25 * 10 ** 10),
    blockHeight: 204361,
    blockTimestamp: '2021-12-10T16:26:42.078000Z',
    eventId: '0000204361-000000-e6cc2',
  },
  {
    accountId: 'dE36Vywi4gzDkuoKrsetu5H4M37AydHAoB798658n9m5ekbmm',
    amount: BigInt(5 * 10 ** 9),
    blockHeight: 211391,
    blockTimestamp: '2021-12-16T10:05:18.032000Z',
    eventId: '0000211391-000000-f8b9f',
  },
];
