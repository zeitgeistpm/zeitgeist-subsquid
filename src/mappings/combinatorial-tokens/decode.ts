import * as ss58 from '@subsquid/ss58';
import { Asset as Asset_v60 } from '../../types/v60';
import { events } from '../../types';
import { _Asset } from '../../consts';
import { formatAssetId } from '../../helper';
import { Event } from '../../processor';


export const tokenMerged = (event: Event): TokenEvent => {
  let decoded: {
    who: string;
    marketId: bigint;
    assetsIn: Asset_v60[];
    assetOut: Asset_v60;
    amount: bigint;
  };
  if (events.combinatorialTokens.tokenMerged.v60.is(event)) {
    decoded = events.combinatorialTokens.tokenMerged.v60.decode(event);
  } else {
    decoded = event.args;
  }

  return {
    accountId: ss58.encode({ prefix: 73, bytes: decoded.who }),
    marketId: Number(decoded.marketId),
    assetIn: decoded.assetsIn.map(asset => formatAssetId(asset)),
    assetOut: [formatAssetId(decoded.assetOut)],
    amount: BigInt(decoded.amount),
  };
};


export const tokenRedeemed = (event: Event): TokenRedeemedEvent => {
  let decoded: {
    who: string;
    marketId: bigint;
    assetIn: Asset_v60;
    assetOut: Asset_v60;
    amountIn: bigint;
    amountOut: bigint;
  };
  if (events.combinatorialTokens.tokenRedeemed.v60.is(event)) {
    decoded = events.combinatorialTokens.tokenRedeemed.v60.decode(event);
  } else {
    decoded = event.args;
  }

  return {
    accountId: ss58.encode({ prefix: 73, bytes: decoded.who }),
    marketId: Number(decoded.marketId),
    assetIn: [formatAssetId(decoded.assetIn)],
    assetOut: [formatAssetId(decoded.assetOut)],
    amountIn: BigInt(decoded.amountIn),
    amountOut: BigInt(decoded.amountOut),
  };
};

export const tokenSplit = (event: Event): TokenEvent => {
  let decoded: {
    who: string;
    marketId: bigint;
    assetIn: Asset_v60;
    assetsOut: Asset_v60[];
    amount: bigint;
  };
  if (events.combinatorialTokens.tokenSplit.v60.is(event)) {
    decoded = events.combinatorialTokens.tokenSplit.v60.decode(event);
  } else {
    decoded = event.args;
  }

  return {
    accountId: ss58.encode({ prefix: 73, bytes: decoded.who }),
    marketId: Number(decoded.marketId),
    assetIn: [formatAssetId(decoded.assetIn)],
    assetOut: decoded.assetsOut.map(asset => formatAssetId(asset)),
    amount: BigInt(decoded.amount),
  };
};

interface TokenEvent {
  accountId: string;
  marketId: number;
  assetIn: string[];
  assetOut: string[];
  amount: bigint;
}

interface TokenRedeemedEvent {
  accountId: string;
  marketId: number;
  assetIn: string[];
  assetOut: string[];
  amountIn: bigint;
  amountOut: bigint;
}