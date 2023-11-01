import { AccountInfo } from '@polkadot/types/interfaces/system';
import { SubstrateBlock, SubstrateExtrinsic } from '@subsquid/substrate-processor';
import { Store } from '@subsquid/typeorm-store';
import { util } from '@zeitgeistpm/sdk';
import {
  Account,
  AccountBalance,
  DisputeMechanism,
  Extrinsic,
  HistoricalAccountBalance,
  MarketCreation,
  MarketEvent,
  MarketStatus,
  PoolStatus,
  ScoringRule,
} from '../model';
import { PoolStatus as _PoolStatus } from '../types/v41';
import { MarketCreation as _MarketCreation, MarketStatus as _MarketStatus } from '../types/v42';
import { Asset, MarketDisputeMechanism, ScoringRule as _ScoringRule } from '../types/v50';
import { Cache, IPFS, Tools } from './util';

export const TREASURY_ACCOUNT = 'dE1VdxVn8xy7HFQG5y5px7T2W1TDpRq1QXHH2ozfZLhBMYiBJ';

export const calcSpotPrice = (
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

export const createAssetsForMarket = async (marketId: string, marketType: any): Promise<any> => {
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
  let raw = await (await Cache.init()).getDecodedMetadata(metadata);
  if (raw && !(process.env.NODE_ENV == 'local')) {
    return raw !== '0' ? (JSON.parse(raw) as DecodedMarketMetadata) : undefined;
  } else {
    try {
      const ipfs = new IPFS();
      raw = await ipfs.read(metadata);
      const rawData = JSON.parse(raw) as DecodedMarketMetadata;
      await (await Cache.init()).setDecodedMetadata(metadata, raw);
      return rawData;
    } catch (err) {
      console.error(err);
      if (err instanceof SyntaxError) {
        await (await Cache.init()).setDecodedMetadata(metadata, '0');
      }
      return undefined;
    }
  }
};

export const extrinsicFromEvent = (event: any): Extrinsic | null => {
  if (!event.extrinsic) return null;
  return new Extrinsic({
    name: event.extrinsic.call.name,
    hash: event.extrinsic.hash,
  });
};

export const formatAssetId = (assetId: Asset): string => {
  switch (assetId.__kind) {
    case 'CategoricalOutcome':
      return JSON.stringify(util.AssetIdFromString('[' + assetId.value.toString() + ']'));
    case 'ForeignAsset':
      return JSON.stringify({ foreignAsset: Number(assetId.value) });
    case 'PoolShare':
      return JSON.stringify(util.AssetIdFromString('pool' + assetId.value.toString()));
    case 'ScalarOutcome':
      const scale = new Array();
      scale.push(+assetId.value[0].toString());
      scale.push(assetId.value[1].__kind);
      return JSON.stringify(util.AssetIdFromString(JSON.stringify(scale)));
    case 'Ztg':
      return 'Ztg';
    default:
      return '';
  }
};

export const formatDisputeMechanism = (disputeMechanism: MarketDisputeMechanism): DisputeMechanism => {
  switch (disputeMechanism.__kind) {
    case 'Authorized':
      return DisputeMechanism.Authorized;
    case 'Court':
      return DisputeMechanism.Court;
    case 'SimpleDisputes':
      return DisputeMechanism.SimpleDisputes;
  }
};

export const formatMarketCreation = (creation: _MarketCreation): MarketCreation => {
  switch (creation.__kind) {
    case 'Advised':
      return MarketCreation.Advised;
    case 'Permissionless':
      return MarketCreation.Permissionless;
  }
};

export const formatMarketEvent = (eventName: string): MarketEvent => {
  switch (eventName) {
    case 'Authorized.AuthorityReported':
      return MarketEvent.MarketReported;
    case 'PredictionMarkets.GlobalDisputeStarted':
      return MarketEvent.GlobalDisputeStarted;
    case 'PredictionMarkets.MarketApproved':
      return MarketEvent.MarketApproved;
    case 'PredictionMarkets.MarketClosed':
      return MarketEvent.MarketClosed;
    case 'PredictionMarkets.MarketCreated':
      return MarketEvent.MarketCreated;
    case 'PredictionMarkets.MarketDestroyed':
      return MarketEvent.MarketDestroyed;
    case 'PredictionMarkets.MarketDisputed':
      return MarketEvent.MarketDisputed;
    case 'PredictionMarkets.MarketExpired':
      return MarketEvent.MarketExpired;
    case 'PredictionMarkets.MarketRejected':
      return MarketEvent.MarketRejected;
    case 'PredictionMarkets.MarketReported':
      return MarketEvent.MarketReported;
    case 'PredictionMarkets.MarketResolved':
      return MarketEvent.MarketResolved;
    case 'Swaps.PoolCreate':
      return MarketEvent.PoolCreate;
    default:
      return MarketEvent.MarketCreated;
  }
};

export const formatMarketStatus = (status: _MarketStatus): MarketStatus => {
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
    default:
      return MarketStatus.Active;
  }
};

export const formatPoolStatus = (status: _PoolStatus): PoolStatus => {
  switch (status.__kind) {
    case 'Active':
      return PoolStatus.Active;
    case 'Clean':
      return PoolStatus.Clean;
    case 'Closed':
      return PoolStatus.Closed;
    case 'CollectingSubsidy':
      return PoolStatus.CollectingSubsidy;
    case 'Initialized':
      return PoolStatus.Initialized;
    default:
      return PoolStatus.Active;
  }
};

export const formatScoringRule = (scoringRule: _ScoringRule): ScoringRule => {
  switch (scoringRule.__kind) {
    case 'CPMM':
      return ScoringRule.CPMM;
    case 'RikiddoSigmoidFeeMarketEma':
      return ScoringRule.RikiddoSigmoidFeeMarketEma;
    case 'Lmsr':
      return ScoringRule.Lmsr;
    case 'Orderbook':
      return ScoringRule.Orderbook;
  }
};

export const getFees = async (block: SubstrateBlock, extrinsic: SubstrateExtrinsic): Promise<bigint> => {
  const id = extrinsic.indexInBlock;
  let fees = await (await Cache.init()).getFee(block.hash + id);
  if (fees) {
    return BigInt(fees);
  }

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
  await (await Cache.init()).setFee(block.hash + id, totalFees.toString());
  return totalFees;
};

export const initBalance = async (acc: Account, store: Store) => {
  const sdk = await Tools.getSDK();
  const blockZero = await sdk.api.rpc.chain.getBlockHash(0);
  const {
    data: { free: amt },
  } = (await sdk.api.query.system.account.at(blockZero, acc.accountId)) as AccountInfo;

  let ab = new AccountBalance();
  ab.id = '0000000000-000000-b3cc3-' + acc.accountId.slice(-5);
  ab.account = acc;
  ab.assetId = 'Ztg';
  ab.balance = amt.toBigInt();
  console.log(`Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await store.save<AccountBalance>(ab);

  let hab = new HistoricalAccountBalance();
  hab.id = '0000000000-000000-b3cc3-' + acc.accountId.slice(-5);
  hab.accountId = acc.accountId;
  hab.event = 'Initialised';
  hab.assetId = ab.assetId;
  hab.dBalance = amt.toBigInt();
  hab.blockNumber = 0;
  hab.timestamp = new Date('1970-01-01T00:00:00.000000Z');
  console.log(`Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await store.save<HistoricalAccountBalance>(hab);
};

export const isBaseAsset = (assetId: Asset | string): boolean => {
  if (typeof assetId === 'string') {
    return assetId.includes('Ztg') || assetId.includes('foreignAsset');
  }
  return assetId.__kind.includes('Ztg') || assetId.__kind.includes('ForeignAsset');
};

export const mergeByAssetId = (balances: any[], weights: any[]): AssetAmountInPoolAndWeight[] =>
  balances.map((b) => ({
    ...b,
    ...weights.find((w) => w['_assetId'].toString() == b['assetId'].toString() && w),
  }));

export const rescale = (value: string): string => {
  return (BigInt(value) * BigInt(10 ** 10)).toString();
};

export const specVersion = (specId: string): number => {
  return +specId.substring(specId.indexOf('@') + 1);
};

interface AssetAmountInPoolAndWeight {
  assetId: string;
  balance: bigint;
  _weight: bigint;
}

interface CategoryData {
  name: string;
  ticker?: string;
  img?: string;
  color?: string;
}

interface DecodedMarketMetadata {
  slug: string;
  question: string;
  description: string;
  categories?: CategoryData[];
  tags?: string[];
  img?: string;
  scalarType?: string;
}
