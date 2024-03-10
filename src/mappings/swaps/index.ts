import { Store } from '@subsquid/typeorm-store';
import * as ss58 from '@subsquid/ss58';
import { util } from '@zeitgeistpm/sdk';
import {
  Account,
  AccountBalance,
  Asset,
  Extrinsic,
  HistoricalAccountBalance,
  HistoricalAsset,
  HistoricalMarket,
  HistoricalPool,
  HistoricalSwap,
  Market,
  MarketEvent,
  Pool,
  PoolStatus,
  Weight,
} from '../../model';
import { Pallet, SWAP_EXACT_AMOUNT_IN, SWAP_EXACT_AMOUNT_OUT, SwapEvent } from '../../consts';
import {
  computeSwapSpotPrice,
  extrinsicFromEvent,
  formatAssetId,
  isBaseAsset,
  mergeByAssetId,
  sortOutcomeAssets,
} from '../../helper';
import { Call, Event } from '../../processor';
import { Tools } from '../../util';
import {
  decodeArbitrageBuyBurnEvent,
  decodeArbitrageMintSellEvent,
  decodePoolActiveEvent,
  decodePoolClosedEvent,
  decodePoolCreateEvent,
  decodePoolDestroyedEvent,
  decodePoolExitCall,
  decodePoolExitEvent,
  decodePoolExitWithExactAssetAmountEvent,
  decodePoolJoinEvent,
  decodePoolJoinWithExactAssetAmountEvent,
  decodeSwapExactAmountInEvent,
  decodeSwapExactAmountOutEvent,
} from './decode';

export const arbitrageBuyBurn = async (
  store: Store,
  event: Event
): Promise<{ historicalAssets: HistoricalAsset[]; historicalMarket: HistoricalMarket } | undefined> => {
  const { poolId } = decodeArbitrageBuyBurnEvent(event);

  const pool = await store.get(Pool, {
    where: { poolId },
    relations: { account: { balances: true } },
  });
  if (!pool) return;

  const market = await store.get(Market, {
    where: { marketId: pool.marketId },
  });
  if (!market) return;

  const poolAssets = mergeByAssetId(pool.account.balances, pool.weights);
  let baseAssetQty: number, baseAssetWeight: number;
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (poolAsset.assetId === pool.baseAsset) {
        baseAssetQty = +poolAsset.balance.toString();
        baseAssetWeight = +poolAsset._weight.toString();
      }
    })
  );

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (isBaseAsset(poolAsset.assetId)) return;
      const asset = await store.get(Asset, {
        where: { assetId: poolAsset.assetId },
      });
      if (!asset) return;
      const assetWeight = +poolAsset._weight.toString();
      const oldAssetQty = asset.amountInPool;
      const oldPrice = asset.price;
      const newAssetQty = poolAsset.balance;
      const newPrice = computeSwapSpotPrice(
        +baseAssetQty.toString(),
        baseAssetWeight,
        +newAssetQty.toString(),
        assetWeight
      );

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      newLiquidity += BigInt(Math.round(asset.price * +asset.amountInPool.toString()));

      const ha = new HistoricalAsset({
        accountId: null,
        assetId: asset.assetId,
        blockNumber: event.block.height,
        dAmountInPool: newAssetQty - oldAssetQty,
        dPrice: newPrice - oldPrice,
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
    by: null,
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: BigInt(0),
    event: MarketEvent.ArbitrageBuyBurn,
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

export const arbitrageMintSell = async (
  store: Store,
  event: Event
): Promise<{ historicalAssets: HistoricalAsset[]; historicalMarket: HistoricalMarket } | undefined> => {
  const { poolId } = decodeArbitrageMintSellEvent(event);

  const pool = await store.get(Pool, {
    where: { poolId },
    relations: { account: { balances: true } },
  });
  if (!pool) return;

  const market = await store.get(Market, {
    where: { marketId: pool.marketId },
  });
  if (!market) return;

  const poolAssets = mergeByAssetId(pool.account.balances, pool.weights);
  let baseAssetQty: number, baseAssetWeight: number;
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (poolAsset.assetId === pool.baseAsset) {
        baseAssetQty = +poolAsset.balance.toString();
        baseAssetWeight = +poolAsset._weight.toString();
      }
    })
  );

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (isBaseAsset(poolAsset.assetId)) return;
      const asset = await store.get(Asset, {
        where: { assetId: poolAsset.assetId },
      });
      if (!asset) return;
      const assetWeight = +poolAsset._weight.toString();
      const oldAssetQty = asset.amountInPool;
      const oldPrice = asset.price;
      const newAssetQty = poolAsset.balance;
      const newPrice = computeSwapSpotPrice(
        +baseAssetQty.toString(),
        baseAssetWeight,
        +newAssetQty.toString(),
        assetWeight
      );

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      newLiquidity += BigInt(Math.round(asset.price * +asset.amountInPool.toString()));

      const ha = new HistoricalAsset({
        accountId: null,
        assetId: asset.assetId,
        blockNumber: event.block.height,
        dAmountInPool: newAssetQty - oldAssetQty,
        dPrice: newPrice - oldPrice,
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
    by: null,
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: BigInt(0),
    event: MarketEvent.ArbritrageMintSell,
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

export const poolActive = async (store: Store, event: Event): Promise<HistoricalPool | undefined> => {
  const { poolId } = decodePoolActiveEvent(event);

  const pool = await store.get(Pool, {
    where: { poolId },
  });
  if (!pool) return;
  pool.status = PoolStatus.Active;
  console.log(`[${event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await store.save<Pool>(pool);

  const hp = new HistoricalPool({
    blockNumber: event.block.height,
    event: event.name.split('.')[1],
    id: event.id + '-' + poolId,
    poolId,
    status: pool.status,
    timestamp: new Date(event.block.timestamp!),
  });
  return hp;
};

export const poolClosed = async (store: Store, event: Event): Promise<HistoricalPool | undefined> => {
  const { poolId } = decodePoolClosedEvent(event);

  const pool = await store.get(Pool, {
    where: { poolId },
  });
  if (!pool) return;
  pool.status = PoolStatus.Closed;
  console.log(`[${event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await store.save<Pool>(pool);

  const hp = new HistoricalPool({
    blockNumber: event.block.height,
    event: event.name.split('.')[1],
    id: event.id + '-' + poolId,
    poolId,
    status: pool.status,
    timestamp: new Date(event.block.timestamp!),
  });
  return hp;
};

export const poolCreate = async (
  store: Store,
  event: Event
): Promise<
  | { historicalAssets: HistoricalAsset[]; historicalPool: HistoricalPool; historicalMarket: HistoricalMarket }
  | undefined
> => {
  let { cpep, pool, amount, accountId } = decodePoolCreateEvent(event);
  const poolId = Number(cpep.poolId);

  if (!accountId) {
    const sdk = await Tools.getSDK();
    // @ts-ignore
    accountId = (await sdk.api.rpc.swaps.poolAccountId(BigInt(poolId))).toString();
  }

  const account = await store.get(Account, {
    where: { accountId },
    relations: { balances: true },
  });
  if (!account) {
    console.error(`Coudn't find pool account with accountId ${accountId}`);
    return;
  }

  if (!pool.baseAsset) {
    console.error(`Coudn't find base-asset on poolId ${poolId}`);
    return;
  }

  if (!pool.totalWeight) {
    console.error(`Coudn't find total-weight on poolId ${poolId}`);
    return;
  }

  const newPool = new Pool({
    account: account,
    baseAsset: formatAssetId(pool.baseAsset),
    createdAt: new Date(event.block.timestamp!),
    marketId: Number(pool.marketId),
    id: event.id + '-' + poolId,
    poolId,
    status: event.block.specVersion < 39 ? PoolStatus.Active : PoolStatus.Initialized,
    swapFee: pool.swapFee ? pool.swapFee.toString() : null,
    totalSubsidy: pool.totalSubsidy ? pool.totalSubsidy.toString() : null,
    totalWeight: pool.totalWeight.toString(),
    weights: [],
  });
  console.log(`[${event.name}] Saving pool: ${JSON.stringify(newPool, null, 2)}`);
  await store.save<Pool>(newPool);

  const market = await store.get(Market, {
    where: { marketId: newPool.marketId },
  });
  if (!market) return;
  market.pool = newPool;

  let baseAssetQty = newPool.account.balances[newPool.account.balances.length - 1].balance;
  await Promise.all(
    newPool.account.balances.map(async (ab) => {
      if (ab.assetId === newPool.baseAsset) baseAssetQty = ab.balance;
    })
  );

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const assets: Asset[] = [];
  const historicalAssets: HistoricalAsset[] = [];

  if (pool.weights && isBaseAsset(pool.weights[pool.weights.length - 1][0])) {
    const baseAssetWeight = +pool.weights[pool.weights.length - 1][1].toString();
    await Promise.all(
      pool.weights.map(async (weight, i) => {
        const wt = new Weight({
          assetId: formatAssetId(weight[0]),
          weight: weight[1],
        });
        newPool.weights.push(wt);
        if (isBaseAsset(weight[0])) return;

        const ab = await store.findOneBy(AccountBalance, {
          account: { accountId },
          assetId: wt.assetId,
        });
        const assetQty = ab ? Number(ab.balance) : 10 ** 12;
        const asset = new Asset({
          assetId: wt.assetId,
          amountInPool: BigInt(assetQty),
          id: event.id + '-' + pool.marketId + i,
          market,
          pool: newPool,
          price: computeSwapSpotPrice(+baseAssetQty.toString(), baseAssetWeight, assetQty, +wt.weight.toString()),
        });

        assets.push(asset);
        newLiquidity += BigInt(Math.round(asset.price * +asset.amountInPool.toString()));

        const ha = new HistoricalAsset({
          accountId: ss58.encode({ prefix: 73, bytes: cpep.who }),
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
  }
  console.log(`[${event.name}] Saving pool: ${JSON.stringify(newPool, null, 2)}`);
  await store.save<Pool>(newPool);

  const historicalPool = new HistoricalPool({
    blockNumber: event.block.height,
    event: event.name.split('.')[1],
    id: event.id + '-' + poolId,
    poolId,
    status: newPool.status,
    timestamp: new Date(event.block.timestamp!),
  });

  const orderedAssets = sortOutcomeAssets(assets);
  console.log(`[${event.name}] Saving assets: ${JSON.stringify(orderedAssets, null, 2)}`);
  await store.save<Asset>(orderedAssets);

  market.liquidity = newLiquidity;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: ss58.encode({ prefix: 73, bytes: cpep.who }),
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

  return { historicalAssets, historicalPool, historicalMarket };
};

export const poolDestroyed = async (
  store: Store,
  event: Event
): Promise<
  | {
      historicalAccountBalances: HistoricalAccountBalance[];
      historicalAssets: HistoricalAsset[];
      historicalPool: HistoricalPool;
      historicalMarket: HistoricalMarket;
    }
  | undefined
> => {
  const { poolId } = decodePoolDestroyedEvent(event);
  const historicalAccountBalances: HistoricalAccountBalance[] = [];

  const pool = await store.get(Pool, {
    where: { poolId },
    relations: { account: true },
  });
  if (!pool) return;
  pool.status = PoolStatus.Destroyed;
  console.log(`[${event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await store.save<Pool>(pool);

  const historicalPool = new HistoricalPool({
    blockNumber: event.block.height,
    event: event.name.split('.')[1],
    id: event.id + '-' + poolId,
    poolId,
    status: pool.status,
    timestamp: new Date(event.block.timestamp!),
  });

  if (pool.baseAsset) {
    const ab = await store.findOne(AccountBalance, {
      where: {
        account: { accountId: pool.account.accountId },
        assetId: pool.baseAsset,
      },
    });
    if (ab) {
      const hab = new HistoricalAccountBalance({
        accountId: pool.account.accountId,
        assetId: ab.assetId,
        blockNumber: event.block.height,
        dBalance: -ab.balance,
        event: event.name.split('.')[1],
        extrinsic: extrinsicFromEvent(event),
        id: event.id + '-' + pool.account.accountId.slice(-5),
        timestamp: new Date(event.block.timestamp!),
      });
      historicalAccountBalances.push(hab);
    }
  }

  const market = await store.findOneBy(Market, {
    pool: { poolId: Number(poolId) },
  });
  if (!market) return;

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const historicalAssets: HistoricalAsset[] = [];
  const numOfOutcomeAssets = market.outcomeAssets.length;
  if (numOfOutcomeAssets === 0) return;
  for (let i = 0; i < numOfOutcomeAssets; i++) {
    const asset = await store.get(Asset, {
      where: { assetId: market.outcomeAssets[i]! },
    });
    if (!asset) return;
    const oldPrice = asset.price;
    const oldAssetQty = asset.amountInPool;
    const newPrice = 0;
    const newAssetQty = BigInt(0);
    asset.price = newPrice;
    asset.amountInPool = newAssetQty;
    console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
    await store.save<Asset>(asset);

    newLiquidity += BigInt(Math.round(asset.price * +asset.amountInPool.toString()));

    const ha = new HistoricalAsset({
      accountId: null,
      assetId: asset.assetId,
      blockNumber: event.block.height,
      dAmountInPool: newAssetQty - oldAssetQty,
      dPrice: newPrice - oldPrice,
      event: event.name.split('.')[1],
      id: event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
      newAmountInPool: asset.amountInPool,
      newPrice: asset.price,
      timestamp: new Date(event.block.timestamp!),
    });
    historicalAssets.push(ha);

    const abs = await store.find(AccountBalance, {
      where: { assetId: market.outcomeAssets[i]! },
      relations: { account: true },
    });
    await Promise.all(
      abs.map(async (ab) => {
        if (ab.balance === BigInt(0)) return;

        const hab = new HistoricalAccountBalance({
          accountId: ab.account.accountId,
          assetId: ab.assetId,
          blockNumber: event.block.height,
          dBalance: -ab.balance,
          event: event.name.split('.')[1],
          extrinsic: extrinsicFromEvent(event),
          id: event.id + '-' + market.marketId + i + '-' + ab.account.accountId.slice(-5),
          timestamp: new Date(event.block.timestamp!),
        });
        historicalAccountBalances.push(hab);
      })
    );
  }

  market.liquidity = newLiquidity;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: null,
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: BigInt(0),
    event: MarketEvent.PoolDestroyed,
    id: event.id + '-' + market.marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });

  return { historicalAccountBalances, historicalAssets, historicalPool, historicalMarket };
};

export const poolExit = async (
  store: Store,
  event: Event
): Promise<{ historicalAssets: HistoricalAsset[]; historicalMarket: HistoricalMarket } | undefined> => {
  const { pae } = decodePoolExitEvent(event);

  const pool = await store.get(Pool, {
    where: { poolId: Number(pae.cpep.poolId) },
    relations: { account: { balances: true } },
  });
  if (!pool) return;

  const market = await store.get(Market, {
    where: { pool: { poolId: pool.poolId } },
  });
  if (!market) return;

  let baseAssetQty = BigInt(0);
  await Promise.all(
    pool.account.balances.map(async (ab) => {
      if (ab.assetId === pool.baseAsset) baseAssetQty = ab.balance;
    })
  );

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const numOfPoolWts = pool.weights.length;
  const baseAssetWeight = +pool.weights[numOfPoolWts - 1]!.weight.toString();
  const historicalAssets: HistoricalAsset[] = [];

  // @ts-ignore
  if (pae.assets) {
    await Promise.all(
      // @ts-ignore
      pae.assets.map(async (a, idx) => {
        if (isBaseAsset(a)) return;
        const assetId = formatAssetId(a);

        const asset = await store.get(Asset, { where: { assetId: assetId } });
        if (!asset) return;

        let assetWeight = 0;
        for (let i = 0; i < numOfPoolWts; i++) {
          if (pool.weights[i].assetId == assetId) {
            assetWeight = +pool.weights[i].weight.toString();
          }
        }
        if (assetWeight == 0) {
          console.error(`Coudn't find weight for the asset: ${assetId}`);
          return;
        }

        const oldAssetQty = asset.amountInPool;
        const newAssetQty = oldAssetQty - BigInt(pae.transferred[idx].toString());
        const oldPrice = asset.price;
        let newPrice = oldPrice;
        if (!market.resolvedOutcome) {
          newPrice = computeSwapSpotPrice(
            +baseAssetQty.toString(),
            baseAssetWeight,
            +newAssetQty.toString(),
            assetWeight
          );
        }
        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await store.save<Asset>(asset);

        newLiquidity += BigInt(Math.round(asset.price * +asset.amountInPool.toString()));

        const ha = new HistoricalAsset({
          accountId: ss58.encode({ prefix: 73, bytes: pae.cpep.who }),
          assetId: asset.assetId,
          blockNumber: event.block.height,
          dAmountInPool: newAssetQty - oldAssetQty,
          dPrice: newPrice - oldPrice,
          event: event.name.split('.')[1],
          id: event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
          newAmountInPool: asset.amountInPool,
          newPrice: asset.price,
          timestamp: new Date(event.block.timestamp!),
        });
        historicalAssets.push(ha);
      })
    );
  } else {
    await Promise.all(
      pool.weights.map(async (wt, idx) => {
        if (idx >= pae.transferred.length - 1) return;
        const asset = await store.get(Asset, {
          where: { assetId: wt.assetId },
        });
        if (!asset) return;

        const assetWeight = +wt.weight.toString();
        const oldAssetQty = asset.amountInPool;
        const newAssetQty = oldAssetQty - BigInt(pae.transferred[idx].toString());
        const oldPrice = asset.price;
        let newPrice = oldPrice;
        if (oldPrice > 0 && oldPrice < 1) {
          newPrice = computeSwapSpotPrice(
            +baseAssetQty.toString(),
            baseAssetWeight,
            +newAssetQty.toString(),
            assetWeight
          );
        }
        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await store.save<Asset>(asset);

        newLiquidity += BigInt(Math.round(asset.price * +asset.amountInPool.toString()));

        const ha = new HistoricalAsset({
          accountId: ss58.encode({ prefix: 73, bytes: pae.cpep.who }),
          assetId: asset.assetId,
          blockNumber: event.block.height,
          dAmountInPool: newAssetQty - oldAssetQty,
          dPrice: newPrice - oldPrice,
          event: event.name.split('.')[1],
          id: event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
          newAmountInPool: asset.amountInPool,
          newPrice: asset.price,
          timestamp: new Date(event.block.timestamp!),
        });
        historicalAssets.push(ha);
      })
    );
  }

  market.liquidity = newLiquidity;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: ss58.encode({ prefix: 73, bytes: pae.cpep.who }),
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: BigInt(0),
    event: MarketEvent.PoolExit,
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

/**
 * This handler is used to debit pool shares from an account
 * When the account exits the pool via call `Swaps.pool_exit`
 */
export const poolExitCall = async (store: Store, call: Call) => {
  const { poolId, poolAmount } = decodePoolExitCall(call);
  const pool = await store.get(Pool, {
    where: { poolId },
  });
  if (!pool) return;

  let accountId;
  if (call.origin) {
    accountId = call.origin.value.value;
  } else if (call.extrinsic && call.extrinsic.signature && call.extrinsic.signature.address) {
    accountId = (call.extrinsic.signature.address as any).value;
  }
  accountId = ss58.encode({ prefix: 73, bytes: accountId });

  const assetId = JSON.stringify(util.AssetIdFromString('pool' + poolId));
  const ab = await store.findOneBy(AccountBalance, {
    account: { accountId },
    assetId: assetId,
  });
  if (!ab) return;
  const oldBalance = ab.balance;
  // Balance is fully debited only if it is less than the amount seeked
  const newBalance = ab.balance > poolAmount ? ab.balance - poolAmount : BigInt(0);
  ab.balance = newBalance;
  console.log(`[${call.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance({
    accountId,
    assetId: ab.assetId,
    blockNumber: call.block.height,
    dBalance: newBalance - oldBalance,
    event: call.name.split('.')[1],
    extrinsic: call.extrinsic ? new Extrinsic({ name: call.name, hash: call.extrinsic.hash }) : null,
    id: call.id + '-' + accountId.slice(-5),
    timestamp: new Date(call.block.timestamp!),
  });
  console.log(`[${call.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await store.save<HistoricalAccountBalance>(hab);
};

export const poolExitWithExactAssetAmount = async (
  store: Store,
  event: Event
): Promise<{ historicalAssets: HistoricalAsset[]; historicalMarket: HistoricalMarket } | undefined> => {
  const { pae } = decodePoolExitWithExactAssetAmountEvent(event);

  const pool = await store.get(Pool, {
    where: { poolId: Number(pae.cpep.poolId) },
    relations: { account: { balances: true } },
  });
  if (!pool) return;
  // @ts-ignore
  if (pae.asset && !isBaseAsset(pae.asset)) return;

  const market = await store.get(Market, {
    where: { pool: { poolId: pool.poolId } },
  });
  if (!market) return;

  const poolAssets = mergeByAssetId(pool.account.balances, pool.weights);
  let baseAssetQty: number, baseAssetWeight: number;
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (poolAsset.assetId === pool.baseAsset) {
        baseAssetQty = +poolAsset.balance.toString();
        baseAssetWeight = +poolAsset._weight.toString();
      }
    })
  );

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (isBaseAsset(poolAsset.assetId)) return;
      const asset = await store.get(Asset, {
        where: { assetId: poolAsset.assetId },
      });
      if (!asset) return;
      const assetWeight = +poolAsset._weight.toString();
      const oldAssetQty = asset.amountInPool;
      const newAssetQty = poolAsset.balance;
      const oldPrice = asset.price;
      const newPrice = computeSwapSpotPrice(
        +baseAssetQty.toString(),
        baseAssetWeight,
        +newAssetQty.toString(),
        assetWeight
      );

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      newLiquidity += BigInt(Math.round(asset.price * +asset.amountInPool.toString()));

      const ha = new HistoricalAsset({
        accountId: ss58.encode({ prefix: 73, bytes: pae.cpep.who }),
        assetId: asset.assetId,
        blockNumber: event.block.height,
        dAmountInPool: newAssetQty - oldAssetQty,
        dPrice: newPrice - oldPrice,
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
    by: ss58.encode({ prefix: 73, bytes: pae.cpep.who }),
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: BigInt(0),
    event: MarketEvent.PoolJoin,
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

export const poolJoin = async (
  store: Store,
  event: Event
): Promise<{ historicalAssets: HistoricalAsset[]; historicalMarket: HistoricalMarket } | undefined> => {
  const { pae } = decodePoolJoinEvent(event);

  const pool = await store.get(Pool, {
    where: { poolId: Number(pae.cpep.poolId) },
    relations: { account: { balances: true } },
  });
  if (!pool) return;

  const market = await store.get(Market, {
    where: { pool: { poolId: pool.poolId } },
  });
  if (!market) return;

  let baseAssetQty = pool.account.balances[pool.account.balances.length - 1].balance;
  await Promise.all(
    pool.account.balances.map(async (ab) => {
      if (ab.assetId === pool.baseAsset) baseAssetQty = ab.balance;
    })
  );

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const numOfPoolWts = pool.weights.length;
  const baseAssetWeight = +pool.weights[numOfPoolWts - 1].weight.toString();
  const historicalAssets: HistoricalAsset[] = [];

  // @ts-ignore
  if (pae.assets) {
    await Promise.all(
      // @ts-ignore
      pae.assets.map(async (a, idx) => {
        if (isBaseAsset(a)) return;
        const assetId = formatAssetId(a);

        const asset = await store.get(Asset, { where: { assetId: assetId } });
        if (!asset) return;

        let assetWeight = 0;
        for (let i = 0; i < numOfPoolWts; i++) {
          if (pool.weights[i].assetId == assetId) {
            assetWeight = +pool.weights[i].weight.toString();
          }
        }
        if (assetWeight == 0) {
          console.error(`Coudn't find weight for the asset: ${assetId}`);
          return;
        }

        const oldAssetQty = asset.amountInPool;
        const newAssetQty = oldAssetQty + BigInt(pae.transferred[idx].toString());
        const oldPrice = asset.price;
        const newPrice = computeSwapSpotPrice(
          +baseAssetQty.toString(),
          baseAssetWeight,
          +newAssetQty.toString(),
          assetWeight
        );

        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await store.save<Asset>(asset);

        newLiquidity += BigInt(Math.round(asset.price * +asset.amountInPool.toString()));

        const ha = new HistoricalAsset({
          accountId: ss58.encode({ prefix: 73, bytes: pae.cpep.who }),
          assetId: asset.assetId,
          blockNumber: event.block.height,
          dAmountInPool: newAssetQty - oldAssetQty,
          dPrice: newPrice - oldPrice,
          event: event.name.split('.')[1],
          id: event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
          newAmountInPool: asset.amountInPool,
          newPrice: asset.price,
          timestamp: new Date(event.block.timestamp!),
        });
        historicalAssets.push(ha);
      })
    );
  } else {
    await Promise.all(
      pool.weights.map(async (wt, idx) => {
        if (idx >= pae.transferred.length - 1) return;
        const asset = await store.get(Asset, {
          where: { assetId: wt.assetId },
        });
        if (!asset) return;
        const assetWeight = +wt.weight.toString();
        const oldAssetQty = asset.amountInPool;
        const newAssetQty = oldAssetQty + BigInt(pae.transferred[idx].toString());
        const oldPrice = asset.price;
        const newPrice = computeSwapSpotPrice(
          +baseAssetQty.toString(),
          baseAssetWeight,
          +newAssetQty.toString(),
          assetWeight
        );

        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await store.save<Asset>(asset);

        newLiquidity += BigInt(Math.round(asset.price * +asset.amountInPool.toString()));

        const ha = new HistoricalAsset({
          accountId: ss58.encode({ prefix: 73, bytes: pae.cpep.who }),
          assetId: asset.assetId,
          blockNumber: event.block.height,
          dAmountInPool: newAssetQty - oldAssetQty,
          dPrice: newPrice - oldPrice,
          event: event.name.split('.')[1],
          id: event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
          newAmountInPool: asset.amountInPool,
          newPrice: asset.price,
          timestamp: new Date(event.block.timestamp!),
        });
        historicalAssets.push(ha);
      })
    );
  }

  market.liquidity = newLiquidity;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: ss58.encode({ prefix: 73, bytes: pae.cpep.who }),
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: BigInt(0),
    event: MarketEvent.PoolJoin,
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

export const poolJoinWithExactAssetAmount = async (
  store: Store,
  event: Event
): Promise<{ historicalAssets: HistoricalAsset[]; historicalMarket: HistoricalMarket } | undefined> => {
  const { pae } = decodePoolJoinWithExactAssetAmountEvent(event);

  const pool = await store.get(Pool, {
    where: { poolId: Number(pae.cpep.poolId) },
    relations: { account: { balances: true } },
  });
  if (!pool) return;
  // @ts-ignore
  if (pae.asset && !isBaseAsset(pae.asset)) return;

  const market = await store.get(Market, {
    where: { pool: { poolId: pool.poolId } },
  });
  if (!market) return;

  const poolAssets = mergeByAssetId(pool.account.balances, pool.weights);
  let baseAssetQty: number, baseAssetWeight: number;
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (poolAsset.assetId === pool.baseAsset) {
        baseAssetQty = +poolAsset.balance.toString();
        baseAssetWeight = +poolAsset._weight.toString();
      }
    })
  );

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (isBaseAsset(poolAsset.assetId)) return;
      const asset = await store.get(Asset, {
        where: { assetId: poolAsset.assetId },
      });
      if (!asset) return;
      const assetWeight = +poolAsset._weight.toString();
      const oldAssetQty = asset.amountInPool;
      const newAssetQty = poolAsset.balance;
      const oldPrice = asset.price;
      const newPrice = computeSwapSpotPrice(
        +baseAssetQty.toString(),
        baseAssetWeight,
        +newAssetQty.toString(),
        assetWeight
      );

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      newLiquidity += BigInt(Math.round(asset.price * +asset.amountInPool.toString()));

      const ha = new HistoricalAsset({
        accountId: ss58.encode({ prefix: 73, bytes: pae.cpep.who }),
        assetId: asset.assetId,
        blockNumber: event.block.height,
        dAmountInPool: newAssetQty - oldAssetQty,
        dPrice: newPrice - oldPrice,
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
    by: ss58.encode({ prefix: 73, bytes: pae.cpep.who }),
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: BigInt(0),
    event: MarketEvent.PoolJoin,
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

export const swapExactAmountIn = async (
  store: Store,
  event: Event
): Promise<
  | { historicalAssets: HistoricalAsset[]; historicalSwap: HistoricalSwap; historicalMarket: HistoricalMarket }
  | undefined
> => {
  const { swapEvent } = decodeSwapExactAmountInEvent(event);
  const poolId = Number(swapEvent.cpep.poolId);
  const accountId = ss58.encode({ prefix: 73, bytes: swapEvent.cpep.who });

  const pool = await store.get(Pool, {
    where: { poolId },
    relations: { account: { balances: true } },
  });
  if (!pool) return;

  const market = await store.get(Market, {
    where: { marketId: pool.marketId },
  });
  if (!market) return;

  // @ts-ignore
  let assetBought = swapEvent.assetOut;
  // @ts-ignore
  let assetSold = swapEvent.assetIn;
  if (!assetBought && !assetSold) {
    if (event.call && event.call.args.assetOut && event.call.args.assetIn) {
      assetBought = event.call.args.assetOut;
      assetSold = event.call.args.assetIn;
    } else if (event.extrinsic && event.extrinsic.call) {
      const args = event.extrinsic.call.args;
      if (!args.calls) {
        assetBought = args.assetOut;
        assetSold = args.assetIn;
      } else {
        for (let ext of args.calls as Array<{ __kind: string; value: any }>) {
          const {
            __kind: prefix,
            value: { __kind, assetIn, assetOut, maxPrice, poolId },
          } = ext;
          if (
            prefix === Pallet.Swaps &&
            __kind === SWAP_EXACT_AMOUNT_IN &&
            poolId === swapEvent.cpep.poolId.toString() &&
            maxPrice === swapEvent.maxPrice
          ) {
            assetBought = assetOut;
            assetSold = assetIn;
            break;
          }
        }
      }
    }
  }
  const assetBoughtQty = BigInt(swapEvent.assetAmountOut.toString());
  const assetSoldQty = BigInt(swapEvent.assetAmountIn.toString());
  const oldVolume = market.volume;
  let newVolume = oldVolume;
  if (isBaseAsset(assetBought) || isBaseAsset(assetSold)) {
    newVolume = isBaseAsset(assetBought) ? oldVolume + assetBoughtQty : oldVolume + assetSoldQty;
  }

  const poolAssets = mergeByAssetId(pool.account.balances, pool.weights);
  let baseAssetQty: number, baseAssetWeight: number;
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (poolAsset.assetId === pool.baseAsset) {
        baseAssetQty = +poolAsset.balance.toString();
        baseAssetWeight = +poolAsset._weight.toString();
      }
    })
  );

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (isBaseAsset(poolAsset.assetId)) return;
      const asset = await store.get(Asset, {
        where: { assetId: poolAsset.assetId },
      });
      if (!asset) return;
      const assetWeight = +poolAsset._weight.toString();
      const oldAssetQty = asset.amountInPool;
      const oldPrice = asset.price;
      const newAssetQty = poolAsset.balance;
      const newPrice = computeSwapSpotPrice(
        +baseAssetQty.toString(),
        baseAssetWeight,
        +newAssetQty.toString(),
        assetWeight
      );

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      newLiquidity += BigInt(Math.round(asset.price * +asset.amountInPool.toString()));

      const ha = new HistoricalAsset({
        accountId: newAssetQty == oldAssetQty ? null : accountId,
        assetId: asset.assetId,
        blockNumber: event.block.height,
        dAmountInPool: newAssetQty - oldAssetQty,
        dPrice: newPrice - oldPrice,
        event: event.name.split('.')[1],
        id: event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
        newAmountInPool: asset.amountInPool,
        newPrice: asset.price,
        timestamp: new Date(event.block.timestamp!),
      });
      historicalAssets.push(ha);
    })
  );

  market.volume = newVolume;
  market.liquidity = newLiquidity;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: accountId,
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: newVolume - oldVolume,
    event: MarketEvent.SwapExactAmountIn,
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
    accountId,
    assetAmountIn: swapEvent.assetAmountIn,
    assetAmountOut: swapEvent.assetAmountOut,
    assetIn: formatAssetId(assetSold),
    assetOut: formatAssetId(assetBought),
    blockNumber: event.block.height,
    event: SwapEvent.SwapExactAmountIn,
    extrinsic: extrinsicFromEvent(event),
    id: event.id,
    timestamp: new Date(event.block.timestamp!),
  });
  return { historicalAssets, historicalSwap, historicalMarket };
};

export const swapExactAmountOut = async (
  store: Store,
  event: Event
): Promise<
  | { historicalAssets: HistoricalAsset[]; historicalSwap: HistoricalSwap; historicalMarket: HistoricalMarket }
  | undefined
> => {
  const { swapEvent } = decodeSwapExactAmountOutEvent(event);
  const poolId = Number(swapEvent.cpep.poolId);
  const accountId = ss58.encode({ prefix: 73, bytes: swapEvent.cpep.who });

  const pool = await store.get(Pool, {
    where: { poolId },
    relations: { account: { balances: true } },
  });
  if (!pool) return;

  const market = await store.get(Market, {
    where: { marketId: pool.marketId },
  });
  if (!market) return;

  // @ts-ignore
  let assetBought = swapEvent.assetOut;
  // @ts-ignore
  let assetSold = swapEvent.assetIn;
  if (!assetBought && !assetSold) {
    if (event.call && event.call.args.assetOut && event.call.args.assetIn) {
      assetBought = event.call.args.assetOut;
      assetSold = event.call.args.assetIn;
    } else if (event.extrinsic && event.extrinsic.call) {
      const args = event.extrinsic.call.args;
      if (!args.calls) {
        assetBought = args.assetOut;
        assetSold = args.assetIn;
      } else {
        for (let ext of args.calls as Array<{ __kind: string; value: any }>) {
          const {
            __kind: prefix,
            value: { __kind, assetIn, assetOut, maxPrice, poolId },
          } = ext;
          if (
            prefix === Pallet.Swaps &&
            __kind === SWAP_EXACT_AMOUNT_OUT &&
            poolId === swapEvent.cpep.poolId.toString() &&
            maxPrice === swapEvent.maxPrice
          ) {
            assetBought = assetOut;
            assetSold = assetIn;
            break;
          }
        }
      }
    }
  }
  const assetBoughtQty = BigInt(swapEvent.assetAmountOut.toString());
  const assetSoldQty = BigInt(swapEvent.assetAmountIn.toString());
  const oldVolume = market.volume;
  let newVolume = oldVolume;
  if (isBaseAsset(assetBought) || isBaseAsset(assetSold)) {
    newVolume = isBaseAsset(assetBought) ? oldVolume + assetBoughtQty : oldVolume + assetSoldQty;
  }

  const poolAssets = mergeByAssetId(pool.account.balances, pool.weights);
  let baseAssetQty: number, baseAssetWeight: number;
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (poolAsset.assetId === pool.baseAsset) {
        baseAssetQty = +poolAsset.balance.toString();
        baseAssetWeight = +poolAsset._weight.toString();
      }
    })
  );

  const oldLiquidity = market.liquidity;
  let newLiquidity = BigInt(0);
  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (isBaseAsset(poolAsset.assetId)) return;
      const asset = await store.get(Asset, {
        where: { assetId: poolAsset.assetId },
      });
      if (!asset) return;
      const assetWeight = +poolAsset._weight.toString();
      const oldAssetQty = asset.amountInPool;
      const oldPrice = asset.price;
      const newAssetQty = poolAsset.balance;
      const newPrice = computeSwapSpotPrice(
        +baseAssetQty.toString(),
        baseAssetWeight,
        +newAssetQty.toString(),
        assetWeight
      );

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await store.save<Asset>(asset);

      newLiquidity += BigInt(Math.round(asset.price * +asset.amountInPool.toString()));

      const ha = new HistoricalAsset({
        accountId: newAssetQty == oldAssetQty ? null : accountId,
        assetId: asset.assetId,
        blockNumber: event.block.height,
        dAmountInPool: newAssetQty - oldAssetQty,
        dPrice: newPrice - oldPrice,
        event: event.name.split('.')[1],
        id: event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
        newAmountInPool: asset.amountInPool,
        newPrice: asset.price,
        timestamp: new Date(event.block.timestamp!),
      });
      historicalAssets.push(ha);
    })
  );

  market.volume = newVolume;
  market.liquidity = newLiquidity;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: accountId,
    dLiquidity: market.liquidity - oldLiquidity,
    dVolume: newVolume - oldVolume,
    event: MarketEvent.SwapExactAmountOut,
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
    accountId,
    assetAmountIn: swapEvent.assetAmountIn,
    assetAmountOut: swapEvent.assetAmountOut,
    assetIn: formatAssetId(assetSold),
    assetOut: formatAssetId(assetBought),
    blockNumber: event.block.height,
    event: SwapEvent.SwapExactAmountOut,
    extrinsic: extrinsicFromEvent(event),
    id: event.id,
    timestamp: new Date(event.block.timestamp!),
  });
  return { historicalAssets, historicalSwap, historicalMarket };
};
