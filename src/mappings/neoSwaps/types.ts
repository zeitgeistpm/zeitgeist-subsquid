import { encodeAddress } from '@polkadot/keyring';
import * as ss58 from '@subsquid/ss58';
import { Ctx, EventItem } from '../../processor';
import {
  NeoSwapsBuyExecutedEvent,
  NeoSwapsExitExecutedEvent,
  NeoSwapsFeesWithdrawnEvent,
  NeoSwapsJoinExecutedEvent,
  NeoSwapsPoolDeployedEvent,
  NeoSwapsSellExecutedEvent,
} from '../../types/events';
import { formatAssetId, NeoPoolAsV50 } from '../helper';

export const getBuyExecutedEvent = (ctx: Ctx, item: EventItem): BuySellExecutedEvent => {
  const event = new NeoSwapsBuyExecutedEvent(ctx, item.event);
  let eventAs, who;
  if (event.isV50) {
    eventAs = event.asV50;
    who = ss58.codec('zeitgeist').encode(eventAs.who);
  } else if (event.isV51) {
    eventAs = event.asV51;
    who = ss58.codec('zeitgeist').encode(eventAs.who);
  } else {
    eventAs = item.event.args;
    who = encodeAddress(eventAs.who, 73);
  }
  const { marketId, amountIn, amountOut, assetOut, swapFeeAmount } = eventAs;
  return {
    who,
    marketId,
    assetExecuted: formatAssetId(assetOut),
    amountIn: BigInt(amountIn),
    amountOut: BigInt(amountOut),
    swapFeeAmount: BigInt(swapFeeAmount),
  };
};

export const getExitExecutedEvent = (ctx: Ctx, item: EventItem): JoinExitExecutedEvent => {
  const event = new NeoSwapsExitExecutedEvent(ctx, item.event);
  let eventAs, who;
  if (event.isV50) {
    eventAs = event.asV50;
    who = ss58.codec('zeitgeist').encode(eventAs.who);
  } else {
    eventAs = item.event.args;
    who = encodeAddress(eventAs.who, 73);
  }
  const { marketId, poolSharesAmount, newLiquidityParameter } = eventAs;
  return {
    who,
    marketId,
    poolSharesAmount: BigInt(poolSharesAmount),
    newLiquidityParameter: BigInt(newLiquidityParameter),
  };
};

export const getFeesWithdrawnEvent = (ctx: Ctx, item: EventItem): FeesWithdrawnEvent => {
  const event = new NeoSwapsFeesWithdrawnEvent(ctx, item.event);
  let eventAs, who;
  if (event.isV50) {
    eventAs = event.asV50;
    who = ss58.codec('zeitgeist').encode(eventAs.who);
  } else {
    eventAs = item.event.args;
    who = encodeAddress(eventAs.who, 73);
  }
  const { marketId, amount } = eventAs;
  return {
    who,
    marketId,
    amount: BigInt(amount),
  };
};

export const getJoinExecutedEvent = (ctx: Ctx, item: EventItem): JoinExitExecutedEvent => {
  const event = new NeoSwapsJoinExecutedEvent(ctx, item.event);
  let eventAs, who;
  if (event.isV50) {
    eventAs = event.asV50;
    who = ss58.codec('zeitgeist').encode(eventAs.who);
  } else {
    eventAs = item.event.args;
    who = encodeAddress(eventAs.who, 73);
  }
  const { marketId, poolSharesAmount, newLiquidityParameter } = eventAs;
  return {
    who,
    marketId,
    poolSharesAmount: BigInt(poolSharesAmount),
    newLiquidityParameter: BigInt(newLiquidityParameter),
  };
};

export const getPoolDeployedEvent = (ctx: Ctx, item: EventItem): PoolDeployedEvent => {
  const event = new NeoSwapsPoolDeployedEvent(ctx, item.event);
  let eventAs, who, accountId, collateral, swapFee;
  if (event.isV50) {
    eventAs = event.asV50;
    who = ss58.codec('zeitgeist').encode(eventAs.who);
    accountId = NeoPoolAsV50[+event.asV50.marketId.toString()].accountId;
    collateral = NeoPoolAsV50[+event.asV50.marketId.toString()].collateral;
    swapFee = NeoPoolAsV50[+event.asV50.marketId.toString()].swapFee;
  } else if (event.isV51) {
    eventAs = event.asV51;
    who = ss58.codec('zeitgeist').encode(eventAs.who);
    accountId = ss58.codec('zeitgeist').encode(eventAs.accountId);
  } else {
    eventAs = item.event.args;
    who = encodeAddress(eventAs.who, 73);
    accountId = encodeAddress(eventAs.accountId, 73);
  }
  const { marketId, liquidityParameter, poolSharesAmount } = eventAs;
  return {
    who,
    marketId,
    accountId,
    collateral: collateral ?? formatAssetId(eventAs.collateral),
    liquidityParameter,
    poolSharesAmount,
    swapFee: swapFee ?? BigInt(eventAs.swapFee),
  };
};

export const getSellExecutedEvent = (ctx: Ctx, item: EventItem): BuySellExecutedEvent => {
  const event = new NeoSwapsSellExecutedEvent(ctx, item.event);
  let eventAs, who;
  if (event.isV50) {
    eventAs = event.asV50;
    who = ss58.codec('zeitgeist').encode(eventAs.who);
  } else if (event.isV51) {
    eventAs = event.asV51;
    who = ss58.codec('zeitgeist').encode(eventAs.who);
  } else {
    eventAs = item.event.args;
    who = encodeAddress(eventAs.who, 73);
  }
  const { marketId, amountIn, amountOut, assetIn, swapFeeAmount } = eventAs;
  return {
    who,
    marketId,
    assetExecuted: formatAssetId(assetIn),
    amountIn: BigInt(amountIn),
    amountOut: BigInt(amountOut),
    swapFeeAmount: BigInt(swapFeeAmount),
  };
};

interface BuySellExecutedEvent {
  who: string;
  marketId: bigint;
  assetExecuted: string;
  amountIn: bigint;
  amountOut: bigint;
  swapFeeAmount: bigint;
}

interface FeesWithdrawnEvent {
  who: string;
  marketId: bigint;
  amount: bigint;
}

interface JoinExitExecutedEvent {
  who: string;
  marketId: bigint;
  poolSharesAmount: bigint;
  newLiquidityParameter: bigint;
}

interface PoolDeployedEvent {
  who: string;
  marketId: bigint;
  accountId: string;
  collateral: string;
  liquidityParameter: bigint;
  poolSharesAmount: bigint;
  swapFee: bigint;
}
