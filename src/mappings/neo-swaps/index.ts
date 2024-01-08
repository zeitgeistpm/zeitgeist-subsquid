import { Store } from '@subsquid/typeorm-store';
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
import { computeNeoSwapSpotPrice, extrinsicFromEvent, isBaseAsset } from '../../helper';
import { Event } from '../../processor';
import {
  decodeBuyExecutedEvent,
  decodeExitExecutedEvent,
  decodeFeesWithdrawnEvent,
  decodeJoinExecutedEvent,
  decodePoolDeployedEvent,
  decodeSellExecutedEvent,
} from './decode';

export const buyExecuted = async (
  store: Store,
  event: Event
): Promise<
  { historicalAssets: HistoricalAsset[]; historicalSwap: HistoricalSwap; historicalPool: HistoricalPool } | undefined
> => {
  const { who, marketId, assetExecuted, amountIn, amountOut, swapFeeAmount } = decodeBuyExecutedEvent(event);

  const market = await store.get(Market, {
    where: { marketId },
    relations: { neoPool: { account: { balances: true } } },
  });
  if (!market || !market.neoPool) return;

  market.neoPool.volume += amountIn;
  market.neoPool.liquiditySharesManager.fees += swapFeeAmount;
  console.log(`[${event.name}] Saving neo-pool: ${JSON.stringify(market.neoPool, null, 2)}`);
  await store.save<NeoPool>(market.neoPool);

  const historicalPool = new HistoricalPool({
    blockNumber: event.block.height,
    dVolume: amountIn,
    event: event.name.split('.')[1],
    id: event.id + '-' + market.marketId,
    poolId: market.marketId,
    status: null,
    timestamp: new Date(event.block.timestamp!),
    volume: market.neoPool.volume,
  });

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    market.neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      const asset = await store.get(Asset, {
        where: { assetId: ab.assetId },
      });
      if (!asset) return;

      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = computeNeoSwapSpotPrice(ab.balance, market.neoPool!.liquidityParameter);
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: asset.assetId === assetExecuted ? who : null,
        assetId: asset.assetId,
        baseAssetTraded: asset.assetId === assetExecuted ? amountIn : null,
        blockNumber: event.block.height,
        dAmountInPool: asset.amountInPool - oldAmountInPool,
        dPrice: asset.price - oldPrice,
        event: event.name.split('.')[1],
        id: event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
        newAmountInPool: asset.amountInPool,
        newPrice: asset.price,
        timestamp: new Date(event.block.timestamp!),
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
    blockNumber: event.block.height,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id,
    timestamp: new Date(event.block.timestamp!),
  });

  return { historicalAssets, historicalSwap, historicalPool };
};

export const exitExecuted = async (store: Store, event: Event): Promise<HistoricalAsset[] | undefined> => {
  const { who, marketId, poolSharesAmount, newLiquidityParameter } = decodeExitExecutedEvent(event);

  const market = await store.get(Market, {
    where: { marketId },
    relations: { neoPool: { account: { balances: true } } },
  });
  if (!market || !market.neoPool) return;

  market.neoPool.liquidityParameter = newLiquidityParameter;
  market.neoPool.liquiditySharesManager.totalShares -= poolSharesAmount;
  console.log(`[${event.name}] Saving neo-pool: ${JSON.stringify(market.neoPool, null, 2)}`);
  await store.save<NeoPool>(market.neoPool);

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    market.neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      const asset = await store.get(Asset, {
        where: { assetId: ab.assetId },
      });
      if (!asset) return;

      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = computeNeoSwapSpotPrice(ab.balance, market.neoPool!.liquidityParameter);
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: who,
        assetId: asset.assetId,
        baseAssetTraded: null,
        blockNumber: event.block.height,
        dAmountInPool: asset.amountInPool - oldAmountInPool,
        dPrice: asset.price - oldPrice,
        event: event.name.split('.')[1],
        id: event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
        newAmountInPool: asset.amountInPool,
        newPrice: asset.price,
        timestamp: new Date(event.block.timestamp!),
      });
      historicalAssets.push(ha);
    })
  );
  return historicalAssets;
};

export const feesWithdrawn = async (store: Store, event: Event): Promise<HistoricalPool | undefined> => {
  const { who, marketId, amount } = decodeFeesWithdrawnEvent(event);

  const market = await store.get(Market, {
    where: { marketId },
    relations: { neoPool: true },
  });
  if (!market || !market.neoPool) return;

  market.neoPool.liquiditySharesManager.fees -= amount;
  console.log(`[${event.name}] Saving neo-pool: ${JSON.stringify(market.neoPool, null, 2)}`);
  await store.save<NeoPool>(market.neoPool);

  const historicalPool = new HistoricalPool({
    blockNumber: event.block.height,
    dVolume: BigInt(0),
    event: event.name.split('.')[1],
    id: event.id + '-' + market.marketId,
    poolId: market.marketId,
    status: null,
    timestamp: new Date(event.block.timestamp!),
    volume: market.neoPool.volume,
  });

  return historicalPool;
};

export const joinExecuted = async (store: Store, event: Event): Promise<HistoricalAsset[] | undefined> => {
  const { who, marketId, poolSharesAmount, newLiquidityParameter } = decodeJoinExecutedEvent(event);

  const market = await store.get(Market, {
    where: { marketId },
    relations: { neoPool: { account: { balances: true } } },
  });
  if (!market || !market.neoPool) return;

  market.neoPool.liquidityParameter = newLiquidityParameter;
  market.neoPool.liquiditySharesManager.totalShares += poolSharesAmount;
  console.log(`[${event.name}] Saving neo-pool: ${JSON.stringify(market.neoPool, null, 2)}`);
  await store.save<NeoPool>(market.neoPool);

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    market.neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      const asset = await store.get(Asset, {
        where: { assetId: ab.assetId },
      });
      if (!asset) return;

      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = computeNeoSwapSpotPrice(ab.balance, market.neoPool!.liquidityParameter);
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: who,
        assetId: asset.assetId,
        baseAssetTraded: null,
        blockNumber: event.block.height,
        dAmountInPool: asset.amountInPool - oldAmountInPool,
        dPrice: asset.price - oldPrice,
        event: event.name.split('.')[1],
        id: event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
        newAmountInPool: asset.amountInPool,
        newPrice: asset.price,
        timestamp: new Date(event.block.timestamp!),
      });
      historicalAssets.push(ha);
    })
  );
  return historicalAssets;
};

export const poolDeployed = async (
  store: Store,
  event: Event
): Promise<{ historicalAssets: HistoricalAsset[]; historicalPool: HistoricalPool } | undefined> => {
  const { who, marketId, accountId, collateral, liquidityParameter, poolSharesAmount, swapFee } =
    decodePoolDeployedEvent(event);

  const account = await store.get(Account, {
    where: { accountId },
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
    createdAt: new Date(event.block.timestamp!),
    id: event.id + '-' + marketId,
    liquidityParameter,
    liquiditySharesManager,
    marketId,
    poolId: marketId,
    swapFee,
    volume: BigInt(0),
  });
  console.log(`[${event.name}] Saving neo pool: ${JSON.stringify(neoPool, null, 2)}`);
  await store.save<NeoPool>(neoPool);

  const market = await store.get(Market, {
    where: { marketId },
  });
  if (!market) return;
  market.neoPool = neoPool;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    event: MarketEvent.PoolDeployed,
    id: event.id + '-' + market.marketId,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    neoPool.account.balances.map(async (ab, i) => {
      if (isBaseAsset(ab.assetId)) return;
      const asset = new Asset({
        assetId: ab.assetId,
        amountInPool: ab.balance,
        id: event.id + '-' + neoPool.marketId + i,
        market: market,
        price: computeNeoSwapSpotPrice(ab.balance, neoPool.liquidityParameter),
      });
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: who,
        assetId: asset.assetId,
        baseAssetTraded: BigInt(0),
        blockNumber: event.block.height,
        dAmountInPool: asset.amountInPool,
        dPrice: asset.price,
        event: event.name.split('.')[1],
        id: event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
        newAmountInPool: asset.amountInPool,
        newPrice: asset.price,
        timestamp: new Date(event.block.timestamp!),
      });
      historicalAssets.push(ha);
    })
  );

  const historicalPool = new HistoricalPool({
    blockNumber: event.block.height,
    dVolume: neoPool.volume,
    event: event.name.split('.')[1],
    id: event.id + '-' + market.marketId,
    poolId: market.marketId,
    status: null,
    timestamp: new Date(event.block.timestamp!),
    volume: neoPool.volume,
  });

  return { historicalAssets, historicalPool };
};

export const sellExecuted = async (
  store: Store,
  event: Event
): Promise<
  { historicalAssets: HistoricalAsset[]; historicalSwap: HistoricalSwap; historicalPool: HistoricalPool } | undefined
> => {
  const { who, marketId, assetExecuted, amountIn, amountOut, swapFeeAmount } = decodeSellExecutedEvent(event);

  const market = await store.get(Market, {
    where: { marketId },
    relations: { neoPool: { account: { balances: true } } },
  });
  if (!market || !market.neoPool) return;

  market.neoPool.volume += amountOut;
  market.neoPool.liquiditySharesManager.fees += swapFeeAmount;
  console.log(`[${event.name}] Saving neo-pool: ${JSON.stringify(market.neoPool, null, 2)}`);
  await store.save<NeoPool>(market.neoPool);

  const historicalPool = new HistoricalPool({
    blockNumber: event.block.height,
    dVolume: amountOut,
    event: event.name.split('.')[1],
    id: event.id + '-' + market.marketId,
    poolId: market.marketId,
    status: null,
    timestamp: new Date(event.block.timestamp!),
    volume: market.neoPool.volume,
  });

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    market.neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      const asset = await store.get(Asset, {
        where: { assetId: ab.assetId },
      });
      if (!asset) return;

      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = computeNeoSwapSpotPrice(ab.balance, market.neoPool!.liquidityParameter);
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: asset.assetId === assetExecuted ? who : null,
        assetId: asset.assetId,
        baseAssetTraded: asset.assetId === assetExecuted ? amountIn : null,
        blockNumber: event.block.height,
        dAmountInPool: asset.amountInPool - oldAmountInPool,
        dPrice: asset.price - oldPrice,
        event: event.name.split('.')[1],
        id: event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
        newAmountInPool: asset.amountInPool,
        newPrice: asset.price,
        timestamp: new Date(event.block.timestamp!),
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
    blockNumber: event.block.height,
    event: event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(event),
    id: event.id,
    timestamp: new Date(event.block.timestamp!),
  });

  return { historicalAssets, historicalSwap, historicalPool };
};
