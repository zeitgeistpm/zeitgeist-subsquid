import { AccountInfo } from '@polkadot/types/interfaces/system';
import { Store } from '@subsquid/typeorm-store';
import { Account, AccountBalance, Extrinsic, HistoricalAccountBalance } from '../model';
import { Tools } from './util';

export const EPOCH_TIME = new Date('1970-01-01T00:00:00.000Z');
export const TEN_MINUTES = 10 * 60 * 1000;
export const TREASURY_ACCOUNT = 'dE1VdxVn8xy7HFQG5y5px7T2W1TDpRq1QXHH2ozfZLhBMYiBJ';
export const ZTG_ASSET = 'Ztg';

export enum CacheHint {
  Fee = 'fee',
  Meta = 'meta',
  Price = 'price',
}

export const extrinsicFromEvent = (event: any): Extrinsic | null => {
  if (!event.extrinsic) return null;
  return new Extrinsic({
    hash: event.extrinsic.hash,
  });
};

export const initBalance = async (acc: Account, store: Store) => {
  const sdk = await Tools.getSDK();
  const blockZero = await sdk.api.rpc.chain.getBlockHash(0);
  const {
    data: { free: amt },
  } = (await sdk.api.query.system.account.at(blockZero, acc.accountId)) as AccountInfo;

  const ab = new AccountBalance({
    account: acc,
    assetId: ZTG_ASSET,
    balance: amt.toBigInt(),
    id: '0000000000-000000-b3cc3-' + acc.accountId.slice(-5),
  });
  console.log(`Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance({
    accountId: acc.accountId,
    assetId: ZTG_ASSET,
    blockNumber: 0,
    dBalance: amt.toBigInt(),
    event: 'Initialised',
    id: '0000000000-000000-b3cc3-' + acc.accountId.slice(-5),
    timestamp: EPOCH_TIME,
  });
  console.log(`Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await store.save<HistoricalAccountBalance>(hab);
};
