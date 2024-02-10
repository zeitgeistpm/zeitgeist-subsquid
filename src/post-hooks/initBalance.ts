import { HistoricalAccountBalance } from '../model';
import { _Asset } from '../consts';
import { PostHookBalance } from '.';

export const initBalance = async (): Promise<HistoricalAccountBalance[]> => {
  const habs: HistoricalAccountBalance[] = [];

  await Promise.all(
    initialBalances.map(async (ib: PostHookBalance) => {
      const hab = new HistoricalAccountBalance({
        accountId: ib.accountId,
        assetId: _Asset.Ztg,
        blockNumber: ib.blockHeight,
        dBalance: ib.amount,
        event: 'Initialised',
        id: ib.eventId + '-' + ib.accountId.slice(-5),
        timestamp: new Date(ib.blockTimestamp),
      });
      habs.push(hab);
    })
  );
  return habs;
};

const initialBalances: PostHookBalance[] = [
  {
    accountId: 'dDykRtA8VyuVVtWTD5PWst3f33L1NMVKseQEji8e3B4ZCHrjK',
    amount: BigInt(100 * 10 ** 10),
    blockHeight: 0,
    blockTimestamp: '1970-01-01T00:00:00.000Z',
    eventId: '0000000000-000000-b3cc3',
  },
  {
    accountId: 'dE1VdxVn8xy7HFQG5y5px7T2W1TDpRq1QXHH2ozfZLhBMYiBJ',
    amount: BigInt(10 ** 8),
    blockHeight: 0,
    blockTimestamp: '1970-01-01T00:00:00.000Z',
    eventId: '0000000000-000000-b3cc3',
  },
];
