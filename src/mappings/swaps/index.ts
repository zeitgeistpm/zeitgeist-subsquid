import { encodeAddress } from '@polkadot/keyring';
import { SubstrateBlock } from '@subsquid/substrate-processor';
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
  Pool,
  PoolStatus,
  Weight,
} from '../../model';
import { Ctx, EventItem } from '../../processor';
import {
  calcSpotPrice,
  extrinsicFromEvent,
  formatAssetId,
  formatMarketEvent,
  formatPoolStatus,
  formatScoringRule,
  isBaseAsset,
  mergeByAssetId,
} from '../helper';
import { Tools } from '../util';
import {
  getArbitrageBuyBurnEvent,
  getArbitrageMintSellEvent,
  getPoolActiveEvent,
  getPoolClosedEvent,
  getPoolCreateEvent,
  getPoolDestroyedEvent,
  getPoolExitCall,
  getPoolExitEvent,
  getPoolExitWithExactAssetAmountEvent,
  getPoolJoinEvent,
  getPoolJoinWithExactAssetAmountEvent,
  getSwapExactAmountInEvent,
  getSwapExactAmountOutEvent,
} from './types';

export const arbitrageBuyBurn = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAsset[] | undefined> => {
  const { poolId, amount } = getArbitrageBuyBurnEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
    relations: { account: { balances: true } },
  });
  if (!pool) return;

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

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (isBaseAsset(poolAsset.assetId)) return;
      const asset = await ctx.store.get(Asset, {
        where: { assetId: poolAsset.assetId },
      });
      if (!asset) return;
      const assetWeight = +poolAsset._weight.toString();
      const oldAssetQty = asset.amountInPool;
      const oldPrice = asset.price;
      const newAssetQty = poolAsset.balance;
      const newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: null,
        assetId: asset.assetId,
        baseAssetTraded: BigInt(0),
        blockNumber: block.height,
        dAmountInPool: newAssetQty - oldAssetQty,
        dPrice: newPrice - oldPrice,
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

export const arbitrageMintSell = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAsset[] | undefined> => {
  const { poolId, amount } = getArbitrageMintSellEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
    relations: { account: { balances: true } },
  });
  if (!pool) return;

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

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (isBaseAsset(poolAsset.assetId)) return;
      const asset = await ctx.store.get(Asset, {
        where: { assetId: poolAsset.assetId },
      });
      if (!asset) return;
      const assetWeight = +poolAsset._weight.toString();
      const oldAssetQty = asset.amountInPool;
      const oldPrice = asset.price;
      const newAssetQty = poolAsset.balance;
      const newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: null,
        assetId: asset.assetId,
        baseAssetTraded: BigInt(0),
        blockNumber: block.height,
        dAmountInPool: newAssetQty - oldAssetQty,
        dPrice: newPrice - oldPrice,
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

export const poolActive = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalPool | undefined> => {
  const { poolId } = getPoolActiveEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
  });
  if (!pool) return;
  pool.status = PoolStatus.Active;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  const hp = new HistoricalPool({
    blockNumber: block.height,
    dVolume: BigInt(0),
    event: item.event.name.split('.')[1],
    id: item.event.id + '-' + pool.poolId,
    poolId: pool.poolId,
    status: pool.status,
    timestamp: new Date(block.timestamp),
    volume: pool.volume,
  });
  return hp;
};

export const poolClosed = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalPool | undefined> => {
  const { poolId } = getPoolClosedEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
  });
  if (!pool) return;
  pool.status = PoolStatus.Closed;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  const hp = new HistoricalPool({
    blockNumber: block.height,
    dVolume: BigInt(0),
    event: item.event.name.split('.')[1],
    id: item.event.id + '-' + pool.poolId,
    poolId: pool.poolId,
    status: pool.status,
    timestamp: new Date(block.timestamp),
    volume: pool.volume,
  });
  return hp;
};

export const poolCreate = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<{ historicalAssets: HistoricalAsset[]; historicalPool: HistoricalPool } | undefined> => {
  let { cpep, swapPool, amount, accountId } = getPoolCreateEvent(ctx, item);

  const poolId = cpep.poolId.toString();
  if (!accountId) {
    const sdk = await Tools.getSDK();
    // @ts-ignore
    accountId = (await sdk.api.rpc.swaps.poolAccountId(poolId)).toString();
  }

  const account = await ctx.store.get(Account, {
    where: { accountId: accountId },
    relations: { balances: true },
  });
  if (!account) {
    console.error(`Coudn't find pool account with accountId ${accountId}`);
    return;
  }

  const pool = new Pool({
    account: account,
    baseAsset: formatAssetId(swapPool.baseAsset),
    createdAt: new Date(block.timestamp),
    marketId: +swapPool.marketId.toString(),
    id: item.event.id + '-' + poolId,
    poolId: +poolId,
    status: formatPoolStatus(swapPool.poolStatus),
    swapFee: swapPool.swapFee ? swapPool.swapFee.toString() : null,
    totalSubsidy: swapPool.totalSubsidy ? swapPool.totalSubsidy.toString() : null,
    totalWeight: swapPool.totalWeight ? swapPool.totalWeight.toString() : '',
    weights: [],
    volume: BigInt(0),
  });
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  let baseAssetQty = pool.account.balances[pool.account.balances.length - 1].balance;
  await Promise.all(
    pool.account.balances.map(async (ab) => {
      if (ab.assetId === pool.baseAsset) baseAssetQty = ab.balance;
    })
  );

  const historicalAssets: HistoricalAsset[] = [];
  if (swapPool.weights && isBaseAsset(swapPool.weights[swapPool.weights.length - 1][0])) {
    const baseAssetWeight = +swapPool.weights[swapPool.weights.length - 1][1].toString();
    await Promise.all(
      swapPool.weights.map(async (weight, i) => {
        const wt = new Weight({
          assetId: formatAssetId(weight[0]),
          weight: weight[1],
        });
        pool.weights.push(wt);
        if (isBaseAsset(weight[0])) return;

        const ab = await ctx.store.findOneBy(AccountBalance, {
          account: { accountId: accountId },
          assetId: wt.assetId,
        });
        const assetQty = ab ? +ab.balance.toString() : 10 ** 12;

        const asset = new Asset({
          assetId: wt.assetId,
          amountInPool: BigInt(assetQty),
          id: item.event.id + '-' + pool.marketId + i,
          pool: pool,
          price: calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, assetQty, +wt.weight.toString()),
        });
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        const ha = new HistoricalAsset({
          accountId: encodeAddress(cpep.who, 73),
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
  }
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  const historicalPool = new HistoricalPool({
    blockNumber: block.height,
    dVolume: BigInt(0),
    event: item.event.name.split('.')[1],
    id: item.event.id + '-' + pool.poolId,
    poolId: pool.poolId,
    status: pool.status,
    timestamp: new Date(block.timestamp),
    volume: pool.volume,
  });

  const market = await ctx.store.get(Market, {
    where: { marketId: pool.marketId },
  });
  if (!market) return;
  market.pool = pool;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: block.height,
    by: null,
    event: formatMarketEvent(item.event.name),
    id: item.event.id + '-' + market.marketId,
    market: market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(block.timestamp),
  });
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);

  return { historicalAssets, historicalPool };
};

export const poolDestroyed = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<
  | {
      historicalAccountBalances: HistoricalAccountBalance[];
      historicalAssets: HistoricalAsset[];
      historicalPool: HistoricalPool;
    }
  | undefined
> => {
  const { poolId } = getPoolDestroyedEvent(ctx, item);
  const historicalAccountBalances: HistoricalAccountBalance[] = [];

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
    relations: { account: true },
  });
  if (!pool) return;
  pool.status = PoolStatus.Destroyed;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  const historicalPool = new HistoricalPool({
    blockNumber: block.height,
    dVolume: BigInt(0),
    event: item.event.name.split('.')[1],
    id: item.event.id + '-' + pool.poolId,
    poolId: pool.poolId,
    status: pool.status,
    timestamp: new Date(block.timestamp),
    volume: pool.volume,
  });

  const ab = await ctx.store.findOne(AccountBalance, {
    where: {
      account: { accountId: pool.account.accountId },
      assetId: pool.baseAsset,
    },
  });
  if (!ab) return;

  const hab = new HistoricalAccountBalance({
    accountId: pool.account.accountId,
    assetId: ab.assetId,
    blockNumber: block.height,
    dBalance: -ab.balance,
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    id: item.event.id + '-' + pool.account.accountId.slice(-5),
    timestamp: new Date(block.timestamp),
  });
  historicalAccountBalances.push(hab);

  const market = await ctx.store.findOneBy(Market, {
    pool: { poolId: Number(poolId) },
  });
  if (!market) return;

  const historicalAssets: HistoricalAsset[] = [];
  const numOfOutcomeAssets = market.outcomeAssets.length;
  if (numOfOutcomeAssets === 0) return;
  for (let i = 0; i < numOfOutcomeAssets; i++) {
    const asset = await ctx.store.get(Asset, {
      where: { assetId: market.outcomeAssets[i]! },
    });
    if (!asset) return;
    const oldPrice = asset.price;
    const oldAssetQty = asset.amountInPool;
    const newPrice = 0;
    const newAssetQty = BigInt(0);
    asset.price = newPrice;
    asset.amountInPool = newAssetQty;
    console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
    await ctx.store.save<Asset>(asset);

    const ha = new HistoricalAsset({
      accountId: null,
      assetId: asset.assetId,
      baseAssetTraded: BigInt(0),
      blockNumber: block.height,
      dAmountInPool: newAssetQty - oldAssetQty,
      dPrice: newPrice - oldPrice,
      event: item.event.name.split('.')[1],
      id: item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
      newAmountInPool: asset.amountInPool,
      newPrice: asset.price,
      timestamp: new Date(block.timestamp),
    });
    historicalAssets.push(ha);

    const abs = await ctx.store.find(AccountBalance, {
      where: { assetId: market.outcomeAssets[i]! },
      relations: { account: true },
    });
    await Promise.all(
      abs.map(async (ab) => {
        if (ab.balance === BigInt(0)) return;

        const hab = new HistoricalAccountBalance({
          accountId: ab.account.accountId,
          assetId: ab.assetId,
          blockNumber: block.height,
          dBalance: -ab.balance,
          event: item.event.name.split('.')[1],
          extrinsic: extrinsicFromEvent(item.event),
          id: item.event.id + '-' + market.marketId + i + '-' + ab.account.accountId.slice(-5),
          timestamp: new Date(block.timestamp),
        });
        historicalAccountBalances.push(hab);
      })
    );
  }
  return { historicalAccountBalances, historicalAssets, historicalPool };
};

export const poolExit = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAsset[] | undefined> => {
  const { pae, walletId } = getPoolExitEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +pae.cpep.poolId.toString() },
    relations: { account: { balances: true } },
  });
  if (!pool) return;

  const market = await ctx.store.get(Market, {
    where: { pool: { poolId: pool.poolId } },
  });
  if (!market) return;

  let baseAssetQty = pool.account.balances[pool.account.balances.length - 1].balance;
  await Promise.all(
    pool.account.balances.map(async (ab) => {
      if (ab.assetId === pool.baseAsset) baseAssetQty = ab.balance;
    })
  );

  const numOfPoolWts = pool.weights.length;
  const baseAssetWeight = +pool.weights[numOfPoolWts - 1]!.weight.toString();
  const historicalAssets: HistoricalAsset[] = [];

  if (pae.assets) {
    await Promise.all(
      pae.assets.map(async (a, idx) => {
        if (isBaseAsset(a)) return;
        const assetId = formatAssetId(a);

        const asset = await ctx.store.get(Asset, { where: { assetId: assetId } });
        if (!asset) return;

        let assetWeight = 0;
        for (let i = 0; i < numOfPoolWts; i++) {
          if (pool!.weights[i]!.assetId == assetId) {
            assetWeight = +pool!.weights[i]!.weight.toString();
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
          newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);
        }
        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        const ha = new HistoricalAsset({
          accountId: walletId,
          assetId: asset.assetId,
          baseAssetTraded: BigInt(0),
          blockNumber: block.height,
          dAmountInPool: newAssetQty - oldAssetQty,
          dPrice: newPrice - oldPrice,
          event: item.event.name.split('.')[1],
          id: item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
          newAmountInPool: asset.amountInPool,
          newPrice: asset.price,
          timestamp: new Date(block.timestamp),
        });
        historicalAssets.push(ha);
      })
    );
  } else {
    await Promise.all(
      pool.weights.map(async (wt, idx) => {
        if (idx >= pae.transferred.length - 1) return;
        const asset = await ctx.store.get(Asset, {
          where: { assetId: wt!.assetId },
        });
        if (!asset) return;

        const assetWeight = +wt!.weight.toString();
        const oldAssetQty = asset.amountInPool;
        const newAssetQty = oldAssetQty - BigInt(pae.transferred[idx].toString());
        const oldPrice = asset.price;
        let newPrice = oldPrice;
        if (oldPrice > 0 && oldPrice < 1) {
          newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);
        }
        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        const ha = new HistoricalAsset({
          accountId: walletId,
          assetId: asset.assetId,
          baseAssetTraded: BigInt(0),
          blockNumber: block.height,
          dAmountInPool: newAssetQty - oldAssetQty,
          dPrice: newPrice - oldPrice,
          event: item.event.name.split('.')[1],
          id: item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
          newAmountInPool: asset.amountInPool,
          newPrice: asset.price,
          timestamp: new Date(block.timestamp),
        });
        historicalAssets.push(ha);
      })
    );
  }
  return historicalAssets;
};

/**
 * This handler is used to debit pool shares from an account
 * When the account exits the pool via call `Swaps.pool_exit`
 */
export const poolExitCall = async (ctx: Ctx, block: SubstrateBlock, item: any) => {
  // @ts-ignore
  const accountId =
    item.call.origin !== undefined ? item.call.origin.value.value : item.extrinsic.signature.address.value;
  const walletId = encodeAddress(accountId, 73);
  // @ts-ignore
  const { poolId, poolAmount } = getPoolExitCall(ctx, item.call);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: poolId },
  });
  if (!pool) return;

  const assetId = JSON.stringify(util.AssetIdFromString('pool' + poolId));
  const ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: walletId },
    assetId: assetId,
  });
  if (!ab) return;
  const oldBalance = ab.balance;
  // Balance is fully debited only if it is less than the amount seeked
  const newBalance = ab.balance > poolAmount ? ab.balance - poolAmount : BigInt(0);
  ab.balance = newBalance;
  console.log(`[${item.call.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await ctx.store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance();
  hab.id = item.call.id + '-' + walletId.slice(-5);
  hab.accountId = walletId;
  hab.event = item.call.name.split('.')[1];
  hab.extrinsic = new Extrinsic({ name: item.call.name, hash: item.extrinsic.hash });
  hab.assetId = ab.assetId;
  hab.dBalance = newBalance - oldBalance;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);
  console.log(`[${item.call.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);
};

export const poolExitWithExactAssetAmount = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAsset[] | undefined> => {
  const { pae, walletId } = getPoolExitWithExactAssetAmountEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +pae.cpep.poolId.toString() },
    relations: { account: { balances: true } },
  });
  if (!pool || !isBaseAsset(pae.asset)) return;

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

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (isBaseAsset(poolAsset.assetId)) return;
      const asset = await ctx.store.get(Asset, {
        where: { assetId: poolAsset.assetId },
      });
      if (!asset) return;
      const assetWeight = +poolAsset._weight.toString();
      const oldAssetQty = asset.amountInPool;
      const newAssetQty = poolAsset.balance;
      const oldPrice = asset.price;
      const newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: walletId,
        assetId: asset.assetId,
        baseAssetTraded: BigInt(0),
        blockNumber: block.height,
        dAmountInPool: newAssetQty - oldAssetQty,
        dPrice: newPrice - oldPrice,
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

export const poolJoin = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAsset[] | undefined> => {
  const { pae, walletId } = getPoolJoinEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +pae.cpep.poolId.toString() },
    relations: { account: { balances: true } },
  });
  if (!pool) return;

  let baseAssetQty = pool.account.balances[pool.account.balances.length - 1].balance;
  await Promise.all(
    pool.account.balances.map(async (ab) => {
      if (ab.assetId === pool.baseAsset) baseAssetQty = ab.balance;
    })
  );

  const numOfPoolWts = pool.weights.length;
  const baseAssetWeight = +pool.weights[numOfPoolWts - 1]!.weight.toString();
  const historicalAssets: HistoricalAsset[] = [];

  if (pae.assets) {
    await Promise.all(
      pae.assets.map(async (a, idx) => {
        if (isBaseAsset(a)) return;
        const assetId = formatAssetId(a);

        const asset = await ctx.store.get(Asset, { where: { assetId: assetId } });
        if (!asset) return;

        let assetWeight = 0;
        for (let i = 0; i < numOfPoolWts; i++) {
          if (pool!.weights[i]!.assetId == assetId) {
            assetWeight = +pool!.weights[i]!.weight.toString();
          }
        }
        if (assetWeight == 0) {
          console.error(`Coudn't find weight for the asset: ${assetId}`);
          return;
        }

        const oldAssetQty = asset.amountInPool;
        const newAssetQty = oldAssetQty + BigInt(pae.transferred[idx].toString());
        const oldPrice = asset.price;
        const newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);

        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        const ha = new HistoricalAsset({
          accountId: walletId,
          assetId: asset.assetId,
          baseAssetTraded: BigInt(0),
          blockNumber: block.height,
          dAmountInPool: newAssetQty - oldAssetQty,
          dPrice: newPrice - oldPrice,
          event: item.event.name.split('.')[1],
          id: item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
          newAmountInPool: asset.amountInPool,
          newPrice: asset.price,
          timestamp: new Date(block.timestamp),
        });
        historicalAssets.push(ha);
      })
    );
  } else {
    await Promise.all(
      pool.weights.map(async (wt, idx) => {
        if (idx >= pae.transferred.length - 1) return;
        const asset = await ctx.store.get(Asset, {
          where: { assetId: wt!.assetId },
        });
        if (!asset) return;
        const assetWeight = +wt!.weight.toString();
        const oldAssetQty = asset.amountInPool;
        const newAssetQty = oldAssetQty + BigInt(pae.transferred[idx].toString());
        const oldPrice = asset.price;
        const newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);

        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        const ha = new HistoricalAsset({
          accountId: walletId,
          assetId: asset.assetId,
          baseAssetTraded: BigInt(0),
          blockNumber: block.height,
          dAmountInPool: newAssetQty - oldAssetQty,
          dPrice: newPrice - oldPrice,
          event: item.event.name.split('.')[1],
          id: item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
          newAmountInPool: asset.amountInPool,
          newPrice: asset.price,
          timestamp: new Date(block.timestamp),
        });
        historicalAssets.push(ha);
      })
    );
  }
  return historicalAssets;
};

export const poolJoinWithExactAssetAmount = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<HistoricalAsset[] | undefined> => {
  const { pae, walletId } = getPoolJoinWithExactAssetAmountEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +pae.cpep.poolId.toString() },
    relations: { account: { balances: true } },
  });
  if (!pool || !isBaseAsset(pae.asset)) return;

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

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (isBaseAsset(poolAsset.assetId)) return;
      const asset = await ctx.store.get(Asset, {
        where: { assetId: poolAsset.assetId },
      });
      if (!asset) return;
      const assetWeight = +poolAsset._weight.toString();
      const oldAssetQty = asset.amountInPool;
      const newAssetQty = poolAsset.balance;
      const oldPrice = asset.price;
      const newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: walletId,
        assetId: asset.assetId,
        baseAssetTraded: BigInt(0),
        blockNumber: block.height,
        dAmountInPool: newAssetQty - oldAssetQty,
        dPrice: newPrice - oldPrice,
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

export const swapExactAmountIn = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<
  | { historicalAssets: HistoricalAsset[]; historicalSwap: HistoricalSwap; historicalPool: HistoricalPool | undefined }
  | undefined
> => {
  const { swapEvent, walletId } = getSwapExactAmountInEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +swapEvent.cpep.poolId.toString() },
    relations: { account: { balances: true } },
  });
  if (!pool) return;

  let assetBought = swapEvent.assetOut;
  let assetSold = swapEvent.assetIn;
  if (!assetBought && !assetSold) {
    if (
      // @ts-ignore
      item.event.call &&
      // @ts-ignore
      item.event.call.args.assetOut &&
      // @ts-ignore
      item.event.call.args.assetIn
    ) {
      // @ts-ignore
      assetBought = item.event.call.args.assetOut;
      // @ts-ignore
      assetSold = item.event.call.args.assetIn;
      // @ts-ignore
    } else if (item.event.extrinsic) {
      // @ts-ignore
      const args = item.event.extrinsic.call.args;
      if (!args.calls) {
        assetBought = args.assetOut;
        assetSold = args.assetIn;
      } else {
        for (let ext of args.calls as Array<{ __kind: string; value: any }>) {
          const {
            __kind: method,
            value: { __kind, assetIn, assetOut, maxPrice, poolId },
          } = ext;
          if (
            method == 'Swaps' &&
            __kind == 'swap_exact_amount_in' &&
            poolId == swapEvent.cpep.poolId.toString() &&
            maxPrice == swapEvent.maxPrice
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

  let oldVolume = pool.volume;
  let newVolume = oldVolume;
  let historicalPool;
  if (isBaseAsset(assetBought) || isBaseAsset(assetSold)) {
    newVolume = isBaseAsset(assetBought) ? oldVolume + assetBoughtQty : oldVolume + assetSoldQty;

    pool.volume = newVolume;
    console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
    await ctx.store.save<Pool>(pool);

    historicalPool = new HistoricalPool({
      blockNumber: block.height,
      dVolume: newVolume - oldVolume,
      event: item.event.name.split('.')[1],
      id: item.event.id + '-' + pool.poolId,
      poolId: pool.poolId,
      status: pool.status,
      timestamp: new Date(block.timestamp),
      volume: pool.volume,
    });
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

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (isBaseAsset(poolAsset.assetId)) return;
      const asset = await ctx.store.get(Asset, {
        where: { assetId: poolAsset.assetId },
      });
      if (!asset) return;
      const assetWeight = +poolAsset._weight.toString();
      const oldAssetQty = asset.amountInPool;
      const oldPrice = asset.price;
      const newAssetQty = poolAsset.balance;
      const newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: newAssetQty == oldAssetQty ? null : walletId,
        assetId: asset.assetId,
        baseAssetTraded: newAssetQty == oldAssetQty ? BigInt(0) : newVolume - oldVolume,
        blockNumber: block.height,
        dAmountInPool: newAssetQty - oldAssetQty,
        dPrice: newPrice - oldPrice,
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
    accountId: walletId,
    assetAmountIn: swapEvent.assetAmountIn,
    assetAmountOut: swapEvent.assetAmountOut,
    assetIn: formatAssetId(assetSold),
    assetOut: formatAssetId(assetBought),
    blockNumber: block.height,
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    id: item.event.id,
    timestamp: new Date(block.timestamp),
  });
  return { historicalAssets, historicalSwap, historicalPool };
};

export const swapExactAmountOut = async (
  ctx: Ctx,
  block: SubstrateBlock,
  item: EventItem
): Promise<
  | { historicalAssets: HistoricalAsset[]; historicalSwap: HistoricalSwap; historicalPool: HistoricalPool | undefined }
  | undefined
> => {
  const { swapEvent, walletId } = getSwapExactAmountOutEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +swapEvent.cpep.poolId.toString() },
    relations: { account: { balances: true } },
  });
  if (!pool) return;

  let assetBought = swapEvent.assetOut;
  let assetSold = swapEvent.assetIn;
  if (!assetBought && !assetSold) {
    if (
      // @ts-ignore
      item.event.call &&
      // @ts-ignore
      item.event.call.args.assetOut &&
      // @ts-ignore
      item.event.call.args.assetIn
    ) {
      // @ts-ignore
      assetBought = item.event.call.args.assetOut;
      // @ts-ignore
      assetSold = item.event.call.args.assetIn;
      // @ts-ignore
    } else if (item.event.extrinsic) {
      // @ts-ignore
      const args = item.event.extrinsic.call.args;
      if (!args.calls) {
        assetBought = args.assetOut;
        assetSold = args.assetIn;
      } else {
        for (let ext of args.calls as Array<{ __kind: string; value: any }>) {
          const {
            __kind: method,
            value: { __kind, assetIn, assetOut, maxPrice, poolId },
          } = ext;
          if (
            method == 'Swaps' &&
            __kind == 'swap_exact_amount_out' &&
            poolId == swapEvent.cpep.poolId.toString() &&
            maxPrice == swapEvent.maxPrice
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

  let oldVolume = pool.volume;
  let newVolume = oldVolume;
  let historicalPool;
  if (isBaseAsset(assetBought) || isBaseAsset(assetSold)) {
    newVolume = isBaseAsset(assetBought) ? oldVolume + assetBoughtQty : oldVolume + assetSoldQty;

    pool.volume = newVolume;
    console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
    await ctx.store.save<Pool>(pool);

    historicalPool = new HistoricalPool({
      blockNumber: block.height,
      dVolume: newVolume - oldVolume,
      event: item.event.name.split('.')[1],
      id: item.event.id + '-' + pool.poolId,
      poolId: pool.poolId,
      status: pool.status,
      timestamp: new Date(block.timestamp),
      volume: pool.volume,
    });
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

  const historicalAssets: HistoricalAsset[] = [];
  await Promise.all(
    poolAssets.map(async (poolAsset) => {
      if (isBaseAsset(poolAsset.assetId)) return;
      const asset = await ctx.store.get(Asset, {
        where: { assetId: poolAsset.assetId },
      });
      if (!asset) return;
      const assetWeight = +poolAsset._weight.toString();
      const oldAssetQty = asset.amountInPool;
      const oldPrice = asset.price;
      const newAssetQty = poolAsset.balance;
      const newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      const ha = new HistoricalAsset({
        accountId: newAssetQty == oldAssetQty ? null : walletId,
        assetId: asset.assetId,
        baseAssetTraded: newAssetQty == oldAssetQty ? BigInt(0) : newVolume - oldVolume,
        blockNumber: block.height,
        dAmountInPool: newAssetQty - oldAssetQty,
        dPrice: newPrice - oldPrice,
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
    accountId: walletId,
    assetAmountIn: swapEvent.assetAmountIn,
    assetAmountOut: swapEvent.assetAmountOut,
    assetIn: formatAssetId(assetSold),
    assetOut: formatAssetId(assetBought),
    blockNumber: block.height,
    event: item.event.name.split('.')[1],
    extrinsic: extrinsicFromEvent(item.event),
    id: item.event.id,
    timestamp: new Date(block.timestamp),
  });
  return { historicalAssets, historicalSwap, historicalPool };
};
