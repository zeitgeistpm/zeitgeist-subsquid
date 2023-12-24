import { AccountInfo } from '@polkadot/types/interfaces/system';
import { DecodedMarketMetadata } from '@zeitgeistpm/sdk/dist/types';
import { util } from '@zeitgeistpm/sdk';
import { Store } from '@subsquid/typeorm-store';
import Decimal from 'decimal.js';
import { Account, AccountBalance, Extrinsic, HistoricalAccountBalance } from './model';
import { MarketType, Asset } from './types/v51';
import { Cache, IPFS, Tools } from './util';
import { Block, Extrinsic as _Extrinsic } from './processor';

export const TEN_MINUTES = 10 * 60 * 1000;
export const TREASURY_ACCOUNT = 'dE1VdxVn8xy7HFQG5y5px7T2W1TDpRq1QXHH2ozfZLhBMYiBJ';

export enum _Asset {
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
  AssetTxPayment = 'AssetTxPayment',
  Authorized = 'Authorized',
  Balances = 'Balances',
  Currency = 'Currency',
  NeoSwaps = 'NeoSwaps',
  ParachainStaking = 'ParachainStaking',
  PredictionMarkets = 'PredictionMarkets',
  Styx = 'Styx',
  System = 'System',
  Tokens = 'Tokens',
}

export const calculateSpotPrice = (amountInPool: bigint, liquidityParameter: bigint): number => {
  const reserve = new Decimal(+amountInPool.toString());
  const liquidity = new Decimal(+liquidityParameter.toString());
  const price = new Decimal(0).minus(reserve).div(liquidity).exp();
  return +price.toString();
};

export const createAssetsForMarket = async (marketId: number, marketType: MarketType): Promise<any> => {
  const sdk = await Tools.getSDK();
  return marketType.__kind == 'Categorical'
    ? [...Array(marketType.value).keys()].map((catIdx) => {
        return sdk.api.createType('Asset', {
          categoricalOutcome: [marketId, catIdx],
        });
      })
    : ['Long', 'Short'].map((pos) => {
        const position = sdk.api.createType('ScalarPosition', pos);
        return sdk.api.createType('Asset', {
          scalarOutcome: [marketId, position.toString()],
        });
      });
};

export const decodeMarketMetadata = async (metadata: string): Promise<DecodedMarketMetadata | undefined> => {
  if (metadata.startsWith('0x1530fa0bb52e67d0d9f89bf26552e1')) return undefined;
  let raw = await (await Cache.init()).getData(CacheHint.Meta, metadata);
  if (raw && !(process.env.NODE_ENV == 'local')) {
    return raw !== '0' ? (JSON.parse(raw) as DecodedMarketMetadata) : undefined;
  } else {
    try {
      const ipfs = new IPFS();
      raw = await ipfs.read(metadata);
      const rawData = JSON.parse(raw) as DecodedMarketMetadata;
      await (await Cache.init()).setData(CacheHint.Meta, metadata, raw);
      return rawData;
    } catch (err) {
      console.error(err);
      if (err instanceof SyntaxError) {
        await (await Cache.init()).setData(CacheHint.Meta, metadata, '0');
      }
      return undefined;
    }
  }
};

export const extrinsicFromEvent = (event: any): Extrinsic | null => {
  if (!event.extrinsic) return null;
  return new Extrinsic({
    hash: event.extrinsic.hash,
    name: event.extrinsic.call ? event.extrinsic.call.name : null,
  });
};

export const formatAssetId = (assetId: Asset): string => {
  switch (assetId.__kind) {
    case _Asset.CategoricalOutcome:
      return JSON.stringify(util.AssetIdFromString('[' + assetId.value.toString() + ']'));
    case _Asset.ForeignAsset:
      return JSON.stringify({ foreignAsset: Number(assetId.value) });
    case _Asset.PoolShare:
      return JSON.stringify(util.AssetIdFromString('pool' + assetId.value.toString()));
    case _Asset.ScalarOutcome:
      const scale = new Array();
      scale.push(+assetId.value[0].toString());
      scale.push(assetId.value[1].__kind);
      return JSON.stringify(util.AssetIdFromString(JSON.stringify(scale)));
    case _Asset.Ztg:
      return _Asset.Ztg;
    default:
      return assetId.__kind;
  }
};

export const getFees = async (block: Block, extrinsic: _Extrinsic): Promise<bigint> => {
  let fees = await (await Cache.init()).getData(CacheHint.Fee, block.hash + extrinsic.index);
  if (fees) return BigInt(fees);

  let totalFees = BigInt(0);
  const sdk = await Tools.getSDK();
  fees = JSON.stringify(await sdk.api.rpc.payment.queryFeeDetails(extrinsic.hash, block.hash));
  if (fees) {
    const feesFormatted = JSON.parse(fees);
    const inclusionFee = feesFormatted.inclusionFee;
    const baseFee = inclusionFee.baseFee;
    const lenFee = inclusionFee.lenFee;
    const adjustedWeightFee = inclusionFee.adjustedWeightFee;
    if (inclusionFee) {
      if (baseFee) totalFees = totalFees + BigInt(baseFee);
      if (lenFee) totalFees = totalFees + BigInt(lenFee);
      if (adjustedWeightFee) totalFees = totalFees + BigInt(adjustedWeightFee);
    }
  }
  await (await Cache.init()).setData(CacheHint.Fee, block.hash + extrinsic.index, totalFees.toString());
  return totalFees;
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
    assetId: _Asset.Ztg,
    balance: amt.toBigInt(),
    id: event.id + '-' + acc.accountId.slice(-5),
  });
  console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance({
    accountId: acc.accountId,
    assetId: _Asset.Ztg,
    blockNumber: 0,
    dBalance: amt.toBigInt(),
    event: event.name.split('.')[1],
    id: event.id + '-' + acc.accountId.slice(-5),
    timestamp: new Date(event.timestamp),
  });
  console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await store.save<HistoricalAccountBalance>(hab);
};

export const isBaseAsset = (assetId: Asset | string): boolean => {
  if (typeof assetId === 'string') {
    return assetId.includes('Ztg') || assetId.includes('foreignAsset');
  }
  return assetId.__kind.includes('Ztg') || assetId.__kind.includes('ForeignAsset');
};

export const rescale = (value: string): string => {
  return (BigInt(value) * BigInt(10 ** 10)).toString();
};
