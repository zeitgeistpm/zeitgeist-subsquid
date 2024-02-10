import { AccountInfo } from '@polkadot/types/interfaces/system';
import { DecodedMarketMetadata } from '@zeitgeistpm/sdk/dist/types';
import { util } from '@zeitgeistpm/sdk';
import { Store } from '@subsquid/typeorm-store';
import Decimal from 'decimal.js';
import {
  Account,
  AccountBalance,
  DisputeMechanism,
  Extrinsic,
  HistoricalAccountBalance,
  MarketStatus,
  ScoringRule,
} from './model';
import {
  Asset,
  MarketDisputeMechanism as _DisputeMechanism,
  MarketType,
  MarketStatus as MarketStatus_v51,
  ScoringRule as ScoringRule_v51,
} from './types/v51';
import { MarketStatus as MarketStatus_v53, ScoringRule as ScoringRule_v53 } from './types/v53';
import { CacheHint, _Asset } from './consts';
import { Block, Extrinsic as _Extrinsic } from './processor';
import { Cache, IPFS, Tools } from './util';

export const computeNeoSwapSpotPrice = (amountInPool: bigint, liquidityParameter: bigint): number => {
  const reserve = new Decimal(+amountInPool.toString());
  const liquidity = new Decimal(+liquidityParameter.toString());
  const price = new Decimal(0).minus(reserve).div(liquidity).exp();
  return +price.toString();
};

export const computeSwapSpotPrice = (
  tokenBalanceIn: number,
  tokenWeightIn: number,
  tokenBalanceOut: number,
  tokenWeightOut: number
): number => {
  if (tokenBalanceOut == 0) return 0;
  const numer = tokenBalanceIn / tokenWeightIn;
  const denom = tokenBalanceOut / tokenWeightOut;
  const spotPrice = numer / denom;
  return spotPrice;
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
  let cachedData;
  if (!isLocalEnv()) {
    cachedData = await (await Cache.init()).getData(CacheHint.Meta, metadata);
  }
  // Fetch from IPFS for new markets / redis-db issues / local environment
  // or if the last request to IPFS failed
  if (!cachedData) {
    let dataToCache;
    try {
      dataToCache = await new IPFS().read(metadata);
    } catch (err) {
      console.error(err);
      if (err instanceof SyntaxError) dataToCache = '0';
    }
    // Store data if data is fetched from IPFS
    if (dataToCache && !isLocalEnv()) {
      await (await Cache.init()).setData(CacheHint.Meta, metadata, dataToCache);
      cachedData = dataToCache;
    }
  }
  // Parse raw data fetched from either IPFS or redis
  return cachedData && cachedData !== '0' ? JSON.parse(cachedData) : undefined;
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

export const formatDisputeMechanism = (
  disputeMechanism: _DisputeMechanism | undefined
): DisputeMechanism | undefined => {
  switch (disputeMechanism?.__kind) {
    case 'Authorized':
      return DisputeMechanism.Authorized;
    case 'Court':
      return DisputeMechanism.Court;
    case 'SimpleDisputes':
      return DisputeMechanism.SimpleDisputes;
  }
};

export const formatScoringRule = (scoringRule: ScoringRule_v51 | ScoringRule_v53): ScoringRule => {
  switch (scoringRule.__kind) {
    case 'CPMM':
      return ScoringRule.CPMM;
    case 'Lmsr':
      return ScoringRule.Lmsr;
    case 'Orderbook':
      return ScoringRule.Orderbook;
    case 'Parimutuel':
      return ScoringRule.Parimutuel;
    case 'RikiddoSigmoidFeeMarketEma':
      return ScoringRule.RikiddoSigmoidFeeMarketEma;
  }
};

export const formatMarketStatus = (status: MarketStatus_v51 | MarketStatus_v53): MarketStatus => {
  switch (status.__kind) {
    case 'Active':
      return MarketStatus.Active;
    case 'Closed':
      return MarketStatus.Closed;
    case 'CollectingSubsidy':
      return MarketStatus.CollectingSubsidy;
    case 'Disputed':
      return MarketStatus.Disputed;
    case 'InsufficientSubsidy':
      return MarketStatus.InsufficientSubsidy;
    case 'Proposed':
      return MarketStatus.Proposed;
    case 'Reported':
      return MarketStatus.Reported;
    case 'Resolved':
      return MarketStatus.Resolved;
    case 'Suspended':
      return MarketStatus.Suspended;
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

export const isBaseAsset = (assetId: Asset | string): boolean => {
  if (typeof assetId === 'string') {
    return assetId.includes('Ztg') || assetId.includes('foreignAsset');
  }
  return assetId.__kind.includes('Ztg') || assetId.__kind.includes('ForeignAsset');
};

export const isBatteryStation = (): boolean => {
  return process.env.WS_NODE_URL!.includes('bs');
};

export const isLocalEnv = (): boolean => {
  return process.env.NODE_ENV === 'local' && process.env.WS_NODE_URL!.includes('blockchain');
};

export const isMainnet = (): boolean => {
  return process.env.WS_NODE_URL!.includes('main');
};

export const isEventOrderValid = (latterEventId: string, formerEventId: string): boolean => {
  if (+latterEventId.split('-')[2] === +formerEventId.split('-')[2] + 1) return true;
  return false;
};

export const mergeByAssetId = (balances: any[], weights: any[]): AssetAmountInPoolAndWeight[] =>
  balances.map((b) => ({
    ...b,
    ...weights.find((w) => w['_assetId'].toString() == b['assetId'].toString() && w),
  }));

export const rescale = (value: string): string => {
  return (BigInt(value) * BigInt(10 ** 10)).toString();
};

interface AssetAmountInPoolAndWeight {
  assetId: string;
  balance: bigint;
  _weight: bigint;
}
