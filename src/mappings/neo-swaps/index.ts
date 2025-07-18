import { createHash } from 'crypto';
import { Store } from '@subsquid/typeorm-store';
import {
  Account,
  Asset,
  CategoryMetadata,
  HistoricalAsset,
  HistoricalMarket,
  HistoricalSwap,
  LiquiditySharesManager,
  Market,
  MarketEvent,
  NeoPool,
} from '../../model';
import { SwapEvent } from '../../consts';
import { computeNeoSwapSpotPrice, extrinsicFromEvent, isBaseAsset, pad } from '../../helper';
import { Event } from '../../processor';
import {
  decodeBuyExecutedEvent,
  decodeCombinatorialPoolDeployed,
  decodeComboBuyExecuted,
  decodeComboSellExecuted,
  decodeExitExecutedEvent,
  decodeFeesWithdrawnEvent,
  decodeJoinExecutedEvent,
  decodePoolDeployedEvent,
  decodeSellExecutedEvent,
} from './decode';

/**
 * Helper function to safely get an Asset instance for combinatorial tokens
 * Returns null if asset doesn't exist to maintain data integrity
 */
const getAssetOrSkip = async (
  store: Store,
  assetId: string,
  expectedMarketId?: number
): Promise<Asset | null> => {
  const asset = await store.get(Asset, {
    where: { assetId },
    relations: { market: true },
  });
  
  if (!asset) {
    console.warn(`Asset ${assetId} not found - potential indexing gap or missing pool deployment`);
    return null;
  }
  
  // Verify market ownership if expectedMarketId is provided
  if (expectedMarketId !== undefined && asset.market.marketId !== expectedMarketId) {
    console.warn(`Asset ${assetId} belongs to market ${asset.market.marketId}, not expected market ${expectedMarketId} - skipping to prevent cross-market corruption`);
    return null;
  }
  
  return asset;
};

export const buyExecuted = async (
  store: Store,
  event: Event
): Promise<
  | { historicalAssets: HistoricalAsset[]; historicalSwap: HistoricalSwap; historicalMarket: HistoricalMarket }
  | undefined
> => {
  const { who, poolId, marketId, assetExecuted, amountIn, amountOut, swapFeeAmount, externalFeeAmount } =
    decodeBuyExecutedEvent(event);

  const market = await store.get(Market, {
    where: { marketId: marketId ?? poolId },
    relations: { neoPool: { account: { balances: true }, liquiditySharesManager: true } },
  });
  if (!market || !market.neoPool) return;

  await Promise.all(
    market.neoPool.liquiditySharesManager.map(async (lsm) => {
      lsm.fees += (lsm.stake / market.neoPool!.totalStake) * swapFeeAmount;
      console.log(`[${event.name}] Saving liquidity-shares-manager: ${JSON.stringify(lsm, null, 2)}`);
      await store.save<LiquiditySharesManager>(lsm);
    })
  );

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    market.neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      let asset = await store.get(Asset, {
        where: { assetId: ab.assetId },
      });
      if (!asset) return;

      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = computeNeoSwapSpotPrice(ab.balance, market.neoPool!.liquidityParameter);
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      newLiquidity += BigInt(Math.round(asset.price * +ab.balance.toString()));

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

  market.liquidity = newLiquidity;
  market.volume += amountIn;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: who,
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: amountIn,
    event: MarketEvent.BuyExecuted,
    id: event.id + '-' + market.marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });

  const historicalSwap = new HistoricalSwap({
    accountId: who,
    assetAmountIn: amountIn,
    assetAmountOut: amountOut,
    assetIn: market.baseAsset,
    assetOut: assetExecuted,
    blockNumber: event.block.height,
    event: SwapEvent.BuyExecuted,
    externalFeeAmount,
    extrinsic: extrinsicFromEvent(event),
    id: event.id,
    swapFeeAmount,
    timestamp: new Date(event.block.timestamp!),
  });

  return { historicalAssets, historicalSwap, historicalMarket };
};

export const combinatorialPoolDeployed = async (
  store: Store,
  event: Event
): Promise<{ historicalAssets: HistoricalAsset[]; historicalMarket: HistoricalMarket } | undefined> => {
  const { who, marketId, poolId, accountId, collateral, liquidityParameter, poolSharesAmount, swapFee } =
    decodeCombinatorialPoolDeployed(event);

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
    id: event.id + '-' + poolId,
    liquidityParameter,
    marketId,
    poolId,
    swapFee,
    totalStake: poolSharesAmount,
  });
  await store.save<NeoPool>(neoPool);

  const liquiditySharesManager = new LiquiditySharesManager({
    account: who,
    fees: BigInt(0),
    id: poolId + '-' + who,
    neoPool,
    stake: poolSharesAmount,
  });
  await store.save<LiquiditySharesManager>(liquiditySharesManager);

  const market = await store.get(Market, {
    where: { marketId },
    relations: { assets: true },
  });
  if (!market) return;

  const assets: Asset[] = [];
  const historicalAssets: HistoricalAsset[] = [];
  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);

  await Promise.all(
    neoPool.account.balances.map(async (ab, i) => {
      if (isBaseAsset(ab.assetId)) return;
      
      // Check if asset already exists to avoid creating duplicates
      let asset = await store.get(Asset, { 
        where: { assetId: ab.assetId },
        relations: { market: true }
      });
      
      if (!asset) {
        // Only create new asset if it doesn't exist (for new combinatorial tokens)
        const hash = createHash('sha256').update(ab.assetId).digest('hex');
        const uniqueId = hash.substring(0, 16);
        
        asset = new Asset({
          id: event.id + '-' + uniqueId,
          assetId: ab.assetId,
          amountInPool: ab.balance,
          price: computeNeoSwapSpotPrice(ab.balance, neoPool.liquidityParameter),
          market,
          pool: null,
        });
        console.log(`[${event.name}] Creating new asset: ${JSON.stringify(asset, null, 2)}`);
      } else {
        if (asset.market.marketId !== market.marketId) {
          return;
        }
        // Update existing asset properties (verified to be from same market)
        asset.amountInPool = ab.balance;
        asset.price = computeNeoSwapSpotPrice(ab.balance, neoPool.liquidityParameter);
      }
      
      assets.push(asset);

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

      newLiquidity += BigInt(Math.round(asset.price * +ab.balance.toString()));
    })
  );
    
  // Store reference to old assets for safe removal
  const oldAssetsToRemove = market.assets.length > 0 ? [...market.assets] : [];
  
  // Preserve ticker/name from existing categorical assets. 
  // TODO: Remove this once we have a way to handle this correctly.
  // market creation should automatically deploy comboTokens
  if (market.assets.length > 0) {
    assets.forEach((newAsset, i) => {
      if (i < market.assets.length) {
        const existingAsset = market.assets[i];
        newAsset.ticker = existingAsset.ticker;
        newAsset.name = existingAsset.name;
      }
    });
  }
  
  // Save new combinatorial assets FIRST to ensure no data loss
  await store.save<Asset>(assets);
  
  // Only remove old categorical assets AFTER successful save of new assets
  if (oldAssetsToRemove.length > 0) {
    await store.remove(oldAssetsToRemove);
  }

  market.liquidity = newLiquidity;
  market.neoPool = neoPool;
  
  market.outcomeAssets = assets.map(asset => asset.assetId);
  
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: BigInt(0),
    event: MarketEvent.CombinatorialPoolDeployed,
    id: event.id + '-' + market.marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });

  return { historicalAssets, historicalMarket };
};

export const comboBuyExecuted = async (
  store: Store,
  event: Event
): Promise<
  | { historicalAssets: HistoricalAsset[]; historicalSwap: HistoricalSwap; historicalMarket: HistoricalMarket }
  | undefined
> => {
  const { who, poolId, assetExecuted, amountIn, amountOut, swapFeeAmount, externalFeeAmount } =
    decodeComboBuyExecuted(event);

  // First find the neo pool by poolId to get the correct marketId
  const neoPool = await store.get(NeoPool, {
    where: { poolId },
    relations: { account: { balances: true }, liquiditySharesManager: true },
  });
  if (!neoPool) return;

  // Then get the market using the correct marketId from the neo pool
  const market = await store.get(Market, {
    where: { marketId: neoPool.marketId },
    relations: { neoPool: { account: { balances: true }, liquiditySharesManager: true } },
  });
  if (!market || !market.neoPool) return;

  await Promise.all(
    market.neoPool.liquiditySharesManager.map(async (lsm) => {
      lsm.fees += (lsm.stake / market.neoPool!.totalStake) * swapFeeAmount;
      console.log(`[${event.name}] Saving liquidity-shares-manager: ${JSON.stringify(lsm, null, 2)}`);
      await store.save<LiquiditySharesManager>(lsm);
    })
  );

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    market.neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      
      const asset = await getAssetOrSkip(store, ab.assetId);
      if (!asset) {
        console.warn(`Skipping processing for missing asset ${ab.assetId} in comboBuyExecuted`);
        return;
      }
      
      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = computeNeoSwapSpotPrice(ab.balance, market.neoPool!.liquidityParameter);
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      newLiquidity += BigInt(Math.round(asset.price * +ab.balance.toString()));

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

  market.liquidity = newLiquidity;
  market.volume += amountIn;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: who,
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: amountIn,
    event: MarketEvent.ComboBuyExecuted,
    id: event.id + '-' + market.marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });

  const historicalSwap = new HistoricalSwap({
    accountId: who,
    assetAmountIn: amountIn,
    assetAmountOut: amountOut,
    assetIn: market.baseAsset,
    assetOut: assetExecuted,
    blockNumber: event.block.height,
    event: SwapEvent.ComboBuyExecuted,
    externalFeeAmount,
    extrinsic: extrinsicFromEvent(event),
    id: event.id,
    swapFeeAmount,
    timestamp: new Date(event.block.timestamp!),
  });

  return { historicalAssets, historicalSwap, historicalMarket };
};

export const comboSellExecuted = async (
  store: Store,
  event: Event
): Promise<
  | { historicalAssets: HistoricalAsset[]; historicalSwap: HistoricalSwap; historicalMarket: HistoricalMarket }
  | undefined
> => {
  const { who, poolId, assetExecuted, amountIn, amountOut, swapFeeAmount, externalFeeAmount } =
    decodeComboSellExecuted(event);

  // First find the neo pool by poolId to get the correct marketId
  const neoPool = await store.get(NeoPool, {
    where: { poolId },
    relations: { account: { balances: true }, liquiditySharesManager: true },
  });
  if (!neoPool) return;

  // Then get the market using the correct marketId from the neo pool
  const market = await store.get(Market, {
    where: { marketId: neoPool.marketId },
    relations: { neoPool: { account: { balances: true }, liquiditySharesManager: true } },
  });
  if (!market || !market.neoPool) return;

  await Promise.all(
    market.neoPool.liquiditySharesManager.map(async (lsm) => {
      lsm.fees += (lsm.stake / market.neoPool!.totalStake) * swapFeeAmount;
      console.log(`[${event.name}] Saving liquidity-shares-manager: ${JSON.stringify(lsm, null, 2)}`);
      await store.save<LiquiditySharesManager>(lsm);
    })
  );

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    market.neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      
      const asset = await getAssetOrSkip(store, ab.assetId);
      if (!asset) {
        console.warn(`Skipping processing for missing asset ${ab.assetId} in comboSellExecuted`);
        return;
      }
      
      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = computeNeoSwapSpotPrice(ab.balance, market.neoPool!.liquidityParameter);
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      newLiquidity += BigInt(Math.round(asset.price * +ab.balance.toString()));

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

  market.liquidity = newLiquidity;
  market.volume += amountOut;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: who,
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: amountOut,
    event: MarketEvent.ComboSellExecuted,
    id: event.id + '-' + market.marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });

  const historicalSwap = new HistoricalSwap({
    accountId: who,
    assetAmountIn: amountIn,
    assetAmountOut: amountOut,
    assetIn: assetExecuted,
    assetOut: market.baseAsset,
    blockNumber: event.block.height,
    event: SwapEvent.ComboSellExecuted,
    externalFeeAmount,
    extrinsic: extrinsicFromEvent(event),
    id: event.id,
    swapFeeAmount,
    timestamp: new Date(event.block.timestamp!),
  });

  return { historicalAssets, historicalSwap, historicalMarket };
};

export const exitExecuted = async (
  store: Store,
  event: Event
): Promise<{ historicalAssets: HistoricalAsset[]; historicalMarket: HistoricalMarket } | undefined> => {
  const { who, poolId, marketId, poolSharesAmount, newLiquidityParameter } = decodeExitExecutedEvent(event);

  const market = await store.get(Market, {
    where: { marketId: marketId ?? poolId },
    relations: { neoPool: { account: { balances: true } } },
  });
  if (!market || !market.neoPool) return;

  const neoPool = market.neoPool;
  neoPool.liquidityParameter = newLiquidityParameter;
  neoPool.totalStake -= poolSharesAmount;
  console.log(`[${event.name}] Saving neo-pool: ${JSON.stringify(neoPool, null, 2)}`);
  await store.save<NeoPool>(neoPool);

  const liquiditySharesManager = await store.get(LiquiditySharesManager, {
    where: { account: who, neoPool: { marketId } },
  });
  if (!liquiditySharesManager) return;
  liquiditySharesManager.stake -= poolSharesAmount;
  console.log(`[${event.name}] Saving liquidity-shares-manager: ${JSON.stringify(liquiditySharesManager, null, 2)}`);
  await store.save<LiquiditySharesManager>(liquiditySharesManager);

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      let asset = await store.get(Asset, {
        where: { assetId: ab.assetId },
      });
      if (!asset) return;

      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = computeNeoSwapSpotPrice(ab.balance, neoPool.liquidityParameter);
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      newLiquidity += BigInt(Math.round(asset.price * +ab.balance.toString()));

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

  market.liquidity = newLiquidity;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: who,
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: BigInt(0),
    event: MarketEvent.ExitExecuted,
    id: event.id + '-' + market.marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });
  return { historicalAssets, historicalMarket };
};

export const feesWithdrawn = async (store: Store, event: Event) => {
  const { who, poolId, marketId, amount } = decodeFeesWithdrawnEvent(event);

  const liquiditySharesManager = await store.get(LiquiditySharesManager, {
    where: { account: who, neoPool: { marketId: marketId ?? poolId } },
  });
  if (!liquiditySharesManager) return;

  liquiditySharesManager.fees = BigInt(0);
  console.log(`[${event.name}] Saving liquidity-shares-manager: ${JSON.stringify(liquiditySharesManager, null, 2)}`);
  await store.save<LiquiditySharesManager>(liquiditySharesManager);
};

export const joinExecuted = async (
  store: Store,
  event: Event
): Promise<{ historicalAssets: HistoricalAsset[]; historicalMarket: HistoricalMarket } | undefined> => {
  const { who, poolId, marketId, poolSharesAmount, newLiquidityParameter } = decodeJoinExecutedEvent(event);

  const market = await store.get(Market, {
    where: { marketId: marketId ?? poolId },
    relations: { neoPool: { account: { balances: true } } },
  });
  if (!market || !market.neoPool) return;

  const neoPool = market.neoPool;
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

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      let asset = await store.get(Asset, {
        where: { assetId: ab.assetId },
      });
      if (!asset) return;

      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = computeNeoSwapSpotPrice(ab.balance, neoPool.liquidityParameter);
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      newLiquidity += BigInt(Math.round(asset.price * +ab.balance.toString()));

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

  market.liquidity = newLiquidity;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: who,
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: BigInt(0),
    event: MarketEvent.JoinExecuted,
    id: event.id + '-' + market.marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });
  return { historicalAssets, historicalMarket };
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
    relations: { assets: true },
  });
  if (!market) return;

  const assets: Asset[] = [];
  const historicalAssets: HistoricalAsset[] = [];
  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);

  await Promise.all(
    neoPool.account.balances.map(async (ab, i) => {
      if (isBaseAsset(ab.assetId)) return;
      let asset = await store.get(Asset, {
        where: { assetId: ab.assetId },
      });
      if (!asset) return;
      asset.amountInPool = ab.balance;
      asset.price = computeNeoSwapSpotPrice(ab.balance, neoPool.liquidityParameter);
      assets.push(asset);

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

      newLiquidity += BigInt(Math.round(asset.price * +ab.balance.toString()));
    })
  );
  console.log(`[${event.name}] Saving assets: ${JSON.stringify(assets, null, 2)}`);
  await store.save<Asset>(assets);

  market.liquidity = newLiquidity;
  market.neoPool = neoPool;
  
  // Replace outcomeAssets with all non-base assets from the pool
  // This ensures outcomeAssets reflects what's actually tradeable in the pool
  const combinatorialAssets = neoPool.account.balances
    .filter(ab => !isBaseAsset(ab.assetId))
    .map(ab => ab.assetId);
  
  // Completely replace outcomeAssets once pool is deployed
  market.outcomeAssets = combinatorialAssets;
  
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: BigInt(0),
    event: MarketEvent.PoolDeployed,
    id: event.id + '-' + market.marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });

  return { historicalAssets, historicalMarket };
};

export const sellExecuted = async (
  store: Store,
  event: Event
): Promise<
  | { historicalAssets: HistoricalAsset[]; historicalSwap: HistoricalSwap; historicalMarket: HistoricalMarket }
  | undefined
> => {
  const { who, poolId, marketId, assetExecuted, amountIn, amountOut, swapFeeAmount, externalFeeAmount } =
    decodeSellExecutedEvent(event);

  const market = await store.get(Market, {
    where: { marketId: marketId ?? poolId },
    relations: { neoPool: { account: { balances: true }, liquiditySharesManager: true } },
  });
  if (!market || !market.neoPool) return;

  await Promise.all(
    market.neoPool.liquiditySharesManager.map(async (lsm) => {
      lsm.fees += (lsm.stake / market.neoPool!.totalStake) * swapFeeAmount;
      console.log(`[${event.name}] Saving liquidity-shares-manager: ${JSON.stringify(lsm, null, 2)}`);
      await store.save<LiquiditySharesManager>(lsm);
    })
  );

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    market.neoPool.account.balances.map(async (ab) => {
      if (isBaseAsset(ab.assetId)) return;
      let asset = await store.get(Asset, {
        where: { assetId: ab.assetId },
      });
      if (!asset) return;

      const oldPrice = asset.price;
      const oldAmountInPool = asset.amountInPool;
      asset.amountInPool = ab.balance;
      asset.price = computeNeoSwapSpotPrice(ab.balance, market.neoPool!.liquidityParameter);
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      newLiquidity += BigInt(Math.round(asset.price * +ab.balance.toString()));

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

  market.liquidity = newLiquidity;
  market.volume += amountOut;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: who,
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: amountOut,
    event: MarketEvent.SellExecuted,
    id: event.id + '-' + market.marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });

  const historicalSwap = new HistoricalSwap({
    accountId: who,
    assetAmountIn: amountIn,
    assetAmountOut: amountOut,
    assetIn: assetExecuted,
    assetOut: market.baseAsset,
    blockNumber: event.block.height,
    event: SwapEvent.SellExecuted,
    externalFeeAmount,
    extrinsic: extrinsicFromEvent(event),
    id: event.id,
    swapFeeAmount,
    timestamp: new Date(event.block.timestamp!),
  });

  return { historicalAssets, historicalSwap, historicalMarket };
};