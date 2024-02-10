import { HistoricalAccountBalance } from '../model';
import { _Asset } from '../consts';
import { isBatteryStation, isMainnet } from '../helper';
import { PostHookBalance } from '.';

export const initBalance = async (): Promise<HistoricalAccountBalance[]> => {
  const event = {
    id: '0000000000-000000-b3cc3',
    name: 'Balances.Initialised',
    timestamp: '1970-01-01T00:00:00.000Z',
  };

  let initialBalances: PostHookBalance[] = [];
  if (isBatteryStation()) {
    initialBalances = bsrInitialBalances;
  } else if (isMainnet()) {
    initialBalances = mainInitialBalances;
  }

  const habs: HistoricalAccountBalance[] = [];
  await Promise.all(
    initialBalances.map(async (ib: PostHookBalance) => {
      const hab = new HistoricalAccountBalance({
        accountId: ib.accountId,
        assetId: _Asset.Ztg,
        blockNumber: 0,
        dBalance: ib.amount,
        event: event.name.split('.')[1],
        id: event.id + '-' + ib.accountId.slice(-5),
        timestamp: new Date(event.timestamp),
      });
      habs.push(hab);
    })
  );
  return habs;
};

const bsrInitialBalances: PostHookBalance[] = [
  {
    accountId: 'dE1VdxVn8xy7HFQG5y5px7T2W1TDpRq1QXHH2ozfZLhBMYiBJ',
    amount: BigInt(10 ** 8),
  },
  {
    accountId: 'dDz7L2zdPVCJG3aEprm1XjMdRUyb8QWckB5nWcnrz7eCV6JEc',
    amount: BigInt(7998 * 10 ** 10),
  },
  {
    accountId: 'dDyymrYQMxP5ksYCLXQjv9oAYiQdJFE9Ampgv8cYxc4qXpTNH',
    amount: BigInt(10000 * 10 ** 10),
  },
  {
    accountId: 'dE1c6MMASgZEtA4dm9qZhE7CXKK3vtbPYw2r56XoYmvyYaNDp',
    amount: BigInt(10000 * 10 ** 10),
  },
];

const mainInitialBalances: PostHookBalance[] = [
  {
    accountId: 'dDykRtA8VyuVVtWTD5PWst3f33L1NMVKseQEji8e3B4ZCHrjK',
    amount: BigInt(100 * 10 ** 10),
  },
  {
    accountId: 'dE1VdxVn8xy7HFQG5y5px7T2W1TDpRq1QXHH2ozfZLhBMYiBJ',
    amount: BigInt(10 ** 8),
  },
];
