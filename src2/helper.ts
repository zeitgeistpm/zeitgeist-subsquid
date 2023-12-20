import { AccountInfo } from '@polkadot/types/interfaces/system';
import { util } from '@zeitgeistpm/sdk';
import { Store } from '@subsquid/typeorm-store';
import { Account, AccountBalance, Extrinsic, HistoricalAccountBalance } from './model';
import { Asset as _Asset } from './types/v51';
import { Tools } from './util';

export const TEN_MINUTES = 10 * 60 * 1000;
export const TREASURY_ACCOUNT = 'dE1VdxVn8xy7HFQG5y5px7T2W1TDpRq1QXHH2ozfZLhBMYiBJ';

export enum Asset {
  CategoricalOutcome = 'CategoricalOutcome',
  ForeignAsset = 'ForeignAsset',
  PoolShare = 'PoolShare',
  ScalarOutcome = 'ScalarOutcome',
  Ztg = 'Ztg',
}

export enum CacheHint {
  Fee = 'fee',
  Meta = 'meta',
  Price = 'price',
}

export enum Pallet {
  Balances = 'Balances',
  Currency = 'Currency',
  ParachainStaking = 'ParachainStaking',
  Tokens = 'Tokens',
}

export const extrinsicFromEvent = (event: any): Extrinsic | null => {
  if (!event.extrinsic) return null;
  return new Extrinsic({
    hash: event.extrinsic.hash,
  });
};

export const formatAssetId = (assetId: _Asset): string => {
  switch (assetId.__kind) {
    case Asset.CategoricalOutcome:
      return JSON.stringify(util.AssetIdFromString('[' + assetId.value.toString() + ']'));
    case Asset.ForeignAsset:
      return JSON.stringify({ foreignAsset: Number(assetId.value) });
    case Asset.PoolShare:
      return JSON.stringify(util.AssetIdFromString('pool' + assetId.value.toString()));
    case Asset.ScalarOutcome:
      const scale = new Array();
      scale.push(+assetId.value[0].toString());
      scale.push(assetId.value[1].__kind);
      return JSON.stringify(util.AssetIdFromString(JSON.stringify(scale)));
    case Asset.Ztg:
      return Asset.Ztg;
    default:
      return assetId.__kind;
  }
};

export const initBalance = async (acc: Account, store: Store) => {
  const event = {
    id: '0000000000-000000-b3cc3',
    name: 'Balances.Initialised',
    timestamp: '1970-01-01T00:00:00.000Z',
  };
  const sdk = await Tools.getSDK();
  const blockZero = await sdk.api.rpc.chain.getBlockHash(0);
  const {
    data: { free: amt },
  } = (await sdk.api.query.system.account.at(blockZero, acc.accountId)) as AccountInfo;

  const ab = new AccountBalance({
    account: acc,
    assetId: Asset.Ztg,
    balance: amt.toBigInt(),
    id: event.id + '-' + acc.accountId.slice(-5),
  });
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance({
    accountId: acc.accountId,
    assetId: Asset.Ztg,
    blockNumber: 0,
    dBalance: amt.toBigInt(),
    event: event.name.split('.')[1],
    id: event.id + '-' + acc.accountId.slice(-5),
    timestamp: new Date(event.timestamp),
  });
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await store.save<HistoricalAccountBalance>(hab);
};
