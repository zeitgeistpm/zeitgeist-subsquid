import { Store } from '@subsquid/typeorm-store';
import {
  Account,
  Asset,
  HistoricalAsset,
  HistoricalMarket,
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
  | { historicalAssets: HistoricalAsset[]; historicalSwap: HistoricalSwap; historicalMarket: HistoricalMarket }
  | undefined
> => {
  const { who, marketId, assetExecuted, amountIn, amountOut, swapFeeAmount } = decodeBuyExecutedEvent(event);

  const market = await store.get(Market, {
    where: { marketId },
    relations: { neoPool: { account: { balances: true }, liquiditySharesManager: true } },
  });
  if (!market || !market.neoPool) return;

  market.volume += amountIn;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  await Promise.all(
    market.neoPool.liquiditySharesManager.map(async (lsm) => {
      lsm.fees += (lsm.stake / market.neoPool!.totalStake) * swapFeeAmount;
      console.log(`[${event.name}] Saving liquidity-shares-manager: ${JSON.stringify(lsm, null, 2)}`);
      await store.save<LiquiditySharesManager>(lsm);
    })
  );

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dVolume: amountIn,
    event: MarketEvent.BuyExecuted,
    id: event.id + '-' + market.marketId,
    market: market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
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

  return { historicalAssets, historicalSwap, historicalMarket };
};

export const exitExecuted = async (store: Store, event: Event): Promise<HistoricalAsset[] | undefined> => {
  const { who, marketId, poolSharesAmount, newLiquidityParameter } = decodeExitExecutedEvent(event);

  const liquiditySharesManager = await store.get(LiquiditySharesManager, {
    where: { account: who, neoPool: { marketId } },
  });
  if (!liquiditySharesManager) return;
  liquiditySharesManager.stake -= poolSharesAmount;
  console.log(`[${event.name}] Saving liquidity-shares-manager: ${JSON.stringify(liquiditySharesManager, null, 2)}`);
  await store.save<LiquiditySharesManager>(liquiditySharesManager);

  const neoPool = await store.get(NeoPool, {
    where: { marketId },
    relations: { account: { balances: true } },
  });
  if (!neoPool) return;

  neoPool.liquidityParameter = newLiquidityParameter;
  neoPool.totalStake -= poolSharesAmount;
  console.log(`[${event.name}] Saving neo-pool: ${JSON.stringify(neoPool, null, 2)}`);
  await store.save<NeoPool>(neoPool);

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      const asset = await store.get(Asset, {
        where: { assetId: ab.assetId },
      });
      if (!asset) return;

      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = computeNeoSwapSpotPrice(ab.balance, neoPool.liquidityParameter);
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: who,
        assetId: asset.assetId,
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

export const feesWithdrawn = async (store: Store, event: Event) => {
  const { who, marketId, amount } = decodeFeesWithdrawnEvent(event);

  const liquiditySharesManager = await store.get(LiquiditySharesManager, {
    where: { account: who, neoPool: { marketId } },
  });
  if (!liquiditySharesManager) return;

  liquiditySharesManager.fees = BigInt(0);
  console.log(`[${event.name}] Saving liquidity-shares-manager: ${JSON.stringify(liquiditySharesManager, null, 2)}`);
  await store.save<LiquiditySharesManager>(liquiditySharesManager);
};

export const joinExecuted = async (store: Store, event: Event): Promise<HistoricalAsset[] | undefined> => {
  const { who, marketId, poolSharesAmount, newLiquidityParameter } = decodeJoinExecutedEvent(event);

  const neoPool = await store.get(NeoPool, {
    where: { marketId },
    relations: { account: { balances: true } },
  });
  if (!neoPool) return;

  neoPool.liquidityParameter = newLiquidityParameter;
  neoPool.totalStake += poolSharesAmount;
  console.log(`[${event.name}] Saving neo-pool: ${JSON.stringify(neoPool, null, 2)}`);
  await store.save<NeoPool>(neoPool);

  let liquiditySharesManager = await store.get(LiquiditySharesManager, {
    where: { account: who, neoPool: { marketId } },
  });
  if (!liquiditySharesManager) {
    liquiditySharesManager = new LiquiditySharesManager({
      account: who,
      fees: BigInt(0),
      id: marketId + '-' + who,
      neoPool,
      stake: BigInt(0),
    });
  }
  liquiditySharesManager.stake += poolSharesAmount;
  console.log(`[${event.name}] Saving liquidity-shares-manager: ${JSON.stringify(liquiditySharesManager, null, 2)}`);
  await store.save<LiquiditySharesManager>(liquiditySharesManager);

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      const asset = await store.get(Asset, {
        where: { assetId: ab.assetId },
      });
      if (!asset) return;

      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = computeNeoSwapSpotPrice(ab.balance, neoPool.liquidityParameter);
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: who,
        assetId: asset.assetId,
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
): Promise<{ historicalAssets: HistoricalAsset[]; historicalMarket: HistoricalMarket } | undefined> => {
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

  const neoPool = new NeoPool({
    account,
    collateral,
    createdAt: new Date(event.block.timestamp!),
    id: event.id + '-' + marketId,
    liquidityParameter,
    marketId,
    poolId: marketId,
    swapFee,
    totalStake: poolSharesAmount,
  });
  console.log(`[${event.name}] Saving neo pool: ${JSON.stringify(neoPool, null, 2)}`);
  await store.save<NeoPool>(neoPool);

  const liquiditySharesManager = new LiquiditySharesManager({
    account: who,
    fees: BigInt(0),
    id: marketId + '-' + who,
    neoPool,
    stake: poolSharesAmount,
  });
  console.log(`[${event.name}] Saving liquidity-shares-manager: ${JSON.stringify(liquiditySharesManager, null, 2)}`);
  await store.save<LiquiditySharesManager>(liquiditySharesManager);

  const market = await store.get(Market, {
    where: { marketId },
  });
  if (!market) return;
  market.neoPool = neoPool;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dVolume: BigInt(0),
    event: MarketEvent.PoolDeployed,
    id: event.id + '-' + market.marketId,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });

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

  return { historicalAssets, historicalMarket };
};

export const sellExecuted = async (
  store: Store,
  event: Event
): Promise<
  | { historicalAssets: HistoricalAsset[]; historicalSwap: HistoricalSwap; historicalMarket: HistoricalMarket }
  | undefined
> => {
  const { who, marketId, assetExecuted, amountIn, amountOut, swapFeeAmount } = decodeSellExecutedEvent(event);

  const market = await store.get(Market, {
    where: { marketId },
    relations: { neoPool: { account: { balances: true }, liquiditySharesManager: true } },
  });
  if (!market || !market.neoPool) return;

  market.volume += amountOut;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  await Promise.all(
    market.neoPool.liquiditySharesManager.map(async (lsm) => {
      lsm.fees += (lsm.stake / market.neoPool!.totalStake) * swapFeeAmount;
      console.log(`[${event.name}] Saving liquidity-shares-manager: ${JSON.stringify(lsm, null, 2)}`);
      await store.save<LiquiditySharesManager>(lsm);
    })
  );

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dVolume: amountOut,
    event: MarketEvent.SellExecuted,
    id: event.id + '-' + market.marketId,
    market: market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
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

  return { historicalAssets, historicalSwap, historicalMarket };
};
