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
} from '../../model';
import { Ctx, EventItem } from '../../processor';
import { calculateSpotPrice, extrinsicFromEvent, isBaseAsset } from '../helper';
import {
  getBuyExecutedEvent,
  getFeesWithdrawnEvent,
  getJoinExecutedEvent,
  getPoolDeployedEvent,
  getSellExecutedEvent,
} from './types';

export const buyExecuted = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<
  { historicalAssets: HistoricalAsset[]; historicalSwap: HistoricalSwap; historicalPool: HistoricalPool } | undefined
> => {
  const { who, marketId, assetExecuted, amountIn, amountOut, swapFeeAmount } = getBuyExecutedEvent(ctx, item);

  const market = await ctx.store.get(Market, {
    where: { marketId: +marketId.toString() },
    relations: { neoPool: { account: { balances: true } } },
  });
  if (!market || !market.neoPool) return;

  market.neoPool.volume += amountIn;
  market.neoPool.liquiditySharesManager.fees += swapFeeAmount;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(market.neoPool, null, 2)}`);
  await ctx.store.save<NeoPool>(market.neoPool);

  const historicalPool = new HistoricalPool({
    blockNumber: block.height,
    dVolume: amountIn,
    event: item.event.name.split('.')[1],
    id: item.event.id + '-' + market.marketId,
    poolId: market.marketId,
    status: null,
    timestamp: new Date(block.timestamp),
    volume: market.neoPool.volume,
  });

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    market.neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      const asset = await ctx.store.get(Asset, {
        where: { assetId: ab.assetId },
      });
      if (!asset) return;

      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = calculateSpotPrice(ab.balance, market.neoPool!.liquidityParameter);
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: asset.assetId === assetExecuted ? who : null,
        assetId: asset.assetId,
        baseAssetTraded: asset.assetId === assetExecuted ? amountIn : null,
        blockNumber: block.height,
        dAmountInPool: asset.amountInPool - oldAmountInPool,
        dPrice: asset.price - oldPrice,
        event: item.event.name.split('.')[1],
        id: item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
        newAmountInPool: asset.amountInPool,
        newPrice: asset.price,
        timestamp: new Date(block.timestamp),
      });
      historicalAssets.push(ha);
    })
  );

  const historicalSwap = new HistoricalSwap({
    accountId: who,
    assetAmountIn: amountIn,
    assetAmountOut: amountOut,
    assetIn: market.baseAsset,
    assetOut: assetExecuted,
    blockNumber: block.height,
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    id: item.event.id,
    timestamp: new Date(block.timestamp),
  });

  return { historicalAssets, historicalSwap, historicalPool };
};

export const feesWithdrawn = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalPool | undefined> => {
  const { who, marketId, amount } = getFeesWithdrawnEvent(ctx, item);

  const market = await ctx.store.get(Market, {
    where: { marketId: +marketId.toString() },
    relations: { neoPool: true },
  });
  if (!market || !market.neoPool) return;

  market.neoPool.liquiditySharesManager.fees -= amount;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(market.neoPool, null, 2)}`);
  await ctx.store.save<NeoPool>(market.neoPool);

  const historicalPool = new HistoricalPool({
    blockNumber: block.height,
    dVolume: BigInt(0),
    event: item.event.name.split('.')[1],
    id: item.event.id + '-' + market.marketId,
    poolId: market.marketId,
    status: null,
    timestamp: new Date(block.timestamp),
    volume: market.neoPool.volume,
  });

  return historicalPool;
};

export const joinExecuted = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAsset[] | undefined> => {
  const { who, marketId, poolSharesAmount, amountsIn, newLiquidityParameter } = getJoinExecutedEvent(ctx, item);

  const market = await ctx.store.get(Market, {
    where: { marketId: +marketId.toString() },
    relations: { neoPool: { account: { balances: true } } },
  });
  if (!market || !market.neoPool) return;

  market.neoPool.liquidityParameter = newLiquidityParameter;
  market.neoPool.liquiditySharesManager.totalShares += poolSharesAmount;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(market.neoPool, null, 2)}`);
  await ctx.store.save<NeoPool>(market.neoPool);

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    market.neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      const asset = await ctx.store.get(Asset, {
        where: { assetId: ab.assetId },
      });
      if (!asset) return;

      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = calculateSpotPrice(ab.balance, market.neoPool!.liquidityParameter);
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: who,
        assetId: asset.assetId,
        baseAssetTraded: BigInt(0),
        blockNumber: block.height,
        dAmountInPool: asset.amountInPool - oldAmountInPool,
        dPrice: asset.price - oldPrice,
        event: item.event.name.split('.')[1],
        id: item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
        newAmountInPool: asset.amountInPool,
        newPrice: asset.price,
        timestamp: new Date(block.timestamp),
      });
      historicalAssets.push(ha);
    })
  );
  return historicalAssets;
};

export const poolDeployed = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<{ historicalAssets: HistoricalAsset[]; historicalPool: HistoricalPool } | undefined> => {
  const { who, marketId, accountId, collateral, liquidityParameter, poolSharesAmount, swapFee } = getPoolDeployedEvent(
    ctx,
    item
  );

  const account = await ctx.store.get(Account, {
    where: { accountId: accountId },
    relations: { balances: true },
  });
  if (!account) {
    console.error(`Coudn't find pool account with accountId ${accountId}`);
    return;
  }

  const liquiditySharesManager = new LiquiditySharesManager({
    fees: BigInt(0),
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
    volume: BigInt(0),
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
      if (isBaseAsset(ab.assetId)) return;
      const asset = new Asset({
        assetId: ab.assetId,
        amountInPool: ab.balance,
        id: item.event.id + '-' + neoPool.marketId + i,
        market: market,
        price: calculateSpotPrice(ab.balance, neoPool.liquidityParameter),
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
    dVolume: neoPool.volume,
    event: item.event.name.split('.')[1],
    id: item.event.id + '-' + market.marketId,
    poolId: market.marketId,
    status: null,
    timestamp: new Date(block.timestamp),
    volume: neoPool.volume,
  });

  return { historicalAssets, historicalPool };
};

export const sellExecuted = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<
  { historicalAssets: HistoricalAsset[]; historicalSwap: HistoricalSwap; historicalPool: HistoricalPool } | undefined
> => {
  const { who, marketId, assetExecuted, amountIn, amountOut, swapFeeAmount } = getSellExecutedEvent(ctx, item);

  const market = await ctx.store.get(Market, {
    where: { marketId: +marketId.toString() },
    relations: { neoPool: { account: { balances: true } } },
  });
  if (!market || !market.neoPool) return;

  market.neoPool.volume += amountOut;
  market.neoPool.liquiditySharesManager.fees += swapFeeAmount;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(market.neoPool, null, 2)}`);
  await ctx.store.save<NeoPool>(market.neoPool);

  const historicalPool = new HistoricalPool({
    blockNumber: block.height,
    dVolume: amountOut,
    event: item.event.name.split('.')[1],
    id: item.event.id + '-' + market.marketId,
    poolId: market.marketId,
    status: null,
    timestamp: new Date(block.timestamp),
    volume: market.neoPool.volume,
  });

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    market.neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      const asset = await ctx.store.get(Asset, {
        where: { assetId: ab.assetId },
      });
      if (!asset) return;

      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = calculateSpotPrice(ab.balance, market.neoPool!.liquidityParameter);
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: asset.assetId === assetExecuted ? who : null,
        assetId: asset.assetId,
        baseAssetTraded: asset.assetId === assetExecuted ? amountIn : null,
        blockNumber: block.height,
        dAmountInPool: asset.amountInPool - oldAmountInPool,
        dPrice: asset.price - oldPrice,
        event: item.event.name.split('.')[1],
        id: item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
        newAmountInPool: asset.amountInPool,
        newPrice: asset.price,
        timestamp: new Date(block.timestamp),
      });
      historicalAssets.push(ha);
    })
  );

  const historicalSwap = new HistoricalSwap({
    accountId: who,
    assetAmountIn: amountIn,
    assetAmountOut: amountOut,
    assetIn: assetExecuted,
    assetOut: market.baseAsset,
    blockNumber: block.height,
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    id: item.event.id,
    timestamp: new Date(block.timestamp),
  });

  return { historicalAssets, historicalSwap, historicalPool };
};
