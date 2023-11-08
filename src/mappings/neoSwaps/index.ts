import { SubstrateBlock } from '@subsquid/substrate-processor';
import {
  Account,
  Asset,
  HistoricalAsset,
  HistoricalMarket,
  HistoricalPool,
  HistoricalSwap,
  LiquiditySharesManager,
  Market,
  MarketEvent,
  NeoPool,
  PoolStatus,
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

export const poolDeployed = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<{ historicalAssets: HistoricalAsset[]; historicalPool: HistoricalPool } | undefined> => {
  let { who, marketId, accountId, collateral, liquidityParameter, poolSharesAmount, swapFee } = getPoolDeployedEvent(
    ctx,
    item
  );

  const account = await ctx.store.get(Account, {
    where: { accountId: accountId },
    relations: { balances: true },
  });

  const liquiditySharesManager = new LiquiditySharesManager({
    fees: null,
    owner: who,
    totalShares: poolSharesAmount,
  });

  const neoPool = new NeoPool({
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
  console.log(`[${item.event.name}] Saving neo pool: ${JSON.stringify(neoPool, null, 2)}`);
  await ctx.store.save<NeoPool>(neoPool);

  const market = await ctx.store.get(Market, {
    where: { marketId: +marketId.toString() },
  });
  if (!market) return;
  market.neoPool = neoPool;
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

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    neoPool.account.balances.map(async (ab, i) => {
      const asset = new Asset({
        assetId: ab.assetId,
        amountInPool: ab.balance,
        id: item.event.id + '-' + neoPool.marketId + i,
        market: market,
        price: 0,
      });
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: who,
        assetId: asset.assetId,
        baseAssetTraded: BigInt(0),
        blockNumber: block.height,
        dAmountInPool: asset.amountInPool,
        dPrice: asset.price,
        event: item.event.name.split('.')[1],
        id: item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
        newAmountInPool: asset.amountInPool,
        newPrice: asset.price,
        timestamp: new Date(block.timestamp),
      });
      historicalAssets.push(ha);
    })
  );

  const historicalPool = new HistoricalPool({
    blockNumber: block.height,
    dVolume: BigInt(0),
    event: item.event.name.split('.')[1],
    id: item.event.id + '-' + neoPool.poolId,
    poolId: neoPool.poolId,
    status: null,
    timestamp: new Date(block.timestamp),
    volume: BigInt(0),
  });

  return { historicalAssets, historicalPool };
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
