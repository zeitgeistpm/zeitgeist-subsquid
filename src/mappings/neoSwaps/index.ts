import { SubstrateBlock } from '@subsquid/substrate-processor';
import {
  Account,
  HistoricalMarket,
  HistoricalSwap,
  LiquiditySharesManager,
  Market,
  MarketEvent,
  NeoPool,
} from '../../model';
import { Ctx, EventItem } from '../../processor';
import { extrinsicFromEvent } from '../helper';
import { getBuyExecutedEvent, getPoolDeployedEvent, getSellExecutedEvent } from './types';

export const buyExecuted = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalSwap | undefined> => {
  let { who, marketId, asset, amountIn, amountOut } = getBuyExecutedEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: +marketId.toString() } });
  if (!market) return;

  const historicalSwap = new HistoricalSwap({
    accountId: who,
    assetAmountIn: amountIn,
    assetAmountOut: amountOut,
    assetIn: market.baseAsset,
    assetOut: asset,
    blockNumber: block.height,
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    id: item.event.id,
    timestamp: new Date(block.timestamp),
  });
  return historicalSwap;
};

export const poolDeployed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  let { who, marketId, accountId, collateral, liquidityParameter, poolSharesAmount, swapFee } = getPoolDeployedEvent(
    ctx,
    item
  );

  let account;
  if (accountId) {
    account = await ctx.store.get(Account, {
      where: { accountId: accountId },
    });
  }

  const liquiditySharesManager = new LiquiditySharesManager({
    fees: null,
    owner: who,
    totalShares: poolSharesAmount,
  });

  const pool = new NeoPool({
    account,
    collateral,
    createdAt: new Date(block.timestamp),
    id: item.event.id + '-' + marketId,
    liquidityParameter,
    liquiditySharesManager,
    marketId: +marketId.toString(),
    poolId: +marketId.toString(),
    swapFee,
  });
  console.log(`[${item.event.name}] Saving neo pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<NeoPool>(pool);

  const market = await ctx.store.get(Market, {
    where: { marketId: +marketId.toString() },
  });
  if (!market) return;
  market.neoPool = pool;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: block.height,
    by: null,
    event: MarketEvent.PoolDeployed,
    id: item.event.id + '-' + market.marketId,
    market: market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(block.timestamp),
  });
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const sellExecuted = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalSwap | undefined> => {
  let { who, marketId, asset, amountIn, amountOut } = getSellExecutedEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: +marketId.toString() } });
  if (!market) return;

  const historicalSwap = new HistoricalSwap({
    accountId: who,
    assetAmountIn: amountIn,
    assetAmountOut: amountOut,
    assetIn: asset,
    assetOut: market.baseAsset,
    blockNumber: block.height,
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    id: item.event.id,
    timestamp: new Date(block.timestamp),
  });
  return historicalSwap;
};
