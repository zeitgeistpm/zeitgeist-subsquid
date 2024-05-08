import * as ss58 from '@subsquid/ss58';
import { MarketAssetClass } from '../../types/v54';
import { events } from '../../types';
import { formatAssetId } from '../../helper';
import { Event } from '../../processor';

export const issued = (event: Event): MarketAssetsIssued => {
  let decoded: {
    assetId: MarketAssetClass;
    owner: string;
    amount: bigint;
  };
  if (events.marketAssets.issued.v54.is(event)) {
    decoded = events.marketAssets.issued.v54.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    assetId: formatAssetId(decoded.assetId),
    owner: ss58.encode({ prefix: 73, bytes: decoded.owner }),
    amount: BigInt(decoded.amount),
  };
};

export const transferred = (event: Event): MarketAssetsTransferred => {
  let decoded: {
    assetId: MarketAssetClass;
    from: string;
    to: string;
    amount: bigint;
  };
  if (events.marketAssets.transferred.v54.is(event)) {
    decoded = events.marketAssets.transferred.v54.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    assetId: formatAssetId(decoded.assetId),
    from: ss58.encode({ prefix: 73, bytes: decoded.from }),
    to: ss58.encode({ prefix: 73, bytes: decoded.to }),
    amount: BigInt(decoded.amount),
  };
};

interface MarketAssetsIssued {
  assetId: string;
  owner: string;
  amount: bigint;
}

interface MarketAssetsTransferred {
  assetId: string;
  from: string;
  to: string;
  amount: bigint;
}
