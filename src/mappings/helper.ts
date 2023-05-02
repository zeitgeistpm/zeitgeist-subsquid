import { AccountInfo } from '@polkadot/types/interfaces/system';
import { SubstrateBlock, SubstrateExtrinsic } from '@subsquid/substrate-processor';
import { Store } from '@subsquid/typeorm-store';
import { util } from '@zeitgeistpm/sdk';
import { Account, AccountBalance, HistoricalAccountBalance, MarketStatus, PoolStatus } from '../model';
import { EventItem } from '../processor';
import { PoolStatus as _PoolStatus } from '../types/v41';
import { Asset, MarketStatus as _MarketStatus } from '../types/v42';
import { Cache, IPFS, Tools } from './util';

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
  let raw = await (await Cache.init()).getMeta(metadata);
  if (raw && !(process.env.NODE_ENV == 'local')) {
    return raw !== '0' ? (JSON.parse(raw) as DecodedMarketMetadata) : undefined;
  } else {
    try {
      const ipfs = new IPFS();
      raw = await ipfs.read(metadata);
      const rawData = JSON.parse(raw) as DecodedMarketMetadata;
      await (await Cache.init()).setMeta(metadata, raw);
      return rawData;
    } catch (err) {
      console.error(err);
      if (err instanceof SyntaxError) {
        await (await Cache.init()).setMeta(metadata, '0');
      }
      return undefined;
    }
  }
};

export const getAssetId = (currencyId: any): string => {
  if (currencyId.__kind == 'CategoricalOutcome') {
    return JSON.stringify(util.AssetIdFromString('[' + currencyId.value.toString() + ']'));
  } else if (currencyId.__kind == 'ScalarOutcome') {
    const scale = new Array();
    scale.push(+currencyId.value[0].toString());
    scale.push(currencyId.value[1].__kind);
    return JSON.stringify(util.AssetIdFromString(JSON.stringify(scale)));
  } else if (currencyId.__kind == 'Ztg') {
    return 'Ztg';
  } else if (currencyId.__kind == 'PoolShare') {
    return JSON.stringify(util.AssetIdFromString('pool' + currencyId.value.toString()));
  } else if (currencyId.__kind == 'ForeignAsset') {
    return JSON.stringify({ foreignAsset: Number(currencyId.value) });
  } else {
    return '';
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

export const getMarketStatus = (status: _MarketStatus): MarketStatus => {
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

export const getPoolStatus = (status: _PoolStatus): PoolStatus => {
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

// @ts-ignore
export const initBalance = async (acc: Account, store: Store, block: SubstrateBlock, item: EventItem) => {
  const sdk = await Tools.getSDK();
  const blockZero = await sdk.api.rpc.chain.getBlockHash(0);
  const {
    data: { free: amt },
  } = (await sdk.api.query.system.account.at(blockZero, acc.accountId)) as AccountInfo;

  let ab = new AccountBalance();
  ab.id = item.event.id + '-' + acc.accountId.substring(acc.accountId.length - 5);
  ab.account = acc;
  ab.assetId = 'Ztg';
  ab.balance = amt.toBigInt();
  console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await store.save<AccountBalance>(ab);

  let hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-000-' + acc.accountId.substring(acc.accountId.length - 5);
  hab.accountId = acc.accountId;
  hab.event = 'Initialised';
  hab.assetId = ab.assetId;
  hab.dBalance = amt.toBigInt();
  hab.blockNumber = 0;
  hab.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await store.save<HistoricalAccountBalance>(hab);
};

export const isBaseAsset = (currencyId: Asset | string): boolean => {
  if (typeof currencyId === 'string') {
    return currencyId.includes('Ztg') || currencyId.includes('foreignAsset');
  }
  return currencyId.__kind.includes('Ztg') || currencyId.__kind.includes('ForeignAsset');
};

export const rescale = (value: string): string => {
  return (BigInt(value) * BigInt(10 ** 10)).toString();
};

interface DecodedMarketMetadata {
  slug: string;
  question: string;
  description: string;
  categories?: CategoryData[];
  tags?: string[];
  img?: string;
  scalarType?: string;
}

interface CategoryData {
  name: string;
  ticker?: string;
  img?: string;
  color?: string;
}

export interface Balance {
  walletId: string;
  amount: bigint;
  hab: HistoricalAccountBalance;
}

export interface Transfer {
  fromId: string;
  toId: string;
  amount: bigint;
  fromHab: HistoricalAccountBalance;
  toHab: HistoricalAccountBalance;
}
