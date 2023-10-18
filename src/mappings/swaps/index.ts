import { encodeAddress } from '@polkadot/keyring';
import { SubstrateBlock } from '@subsquid/substrate-processor';
import * as ss58 from '@subsquid/ss58';
import { util } from '@zeitgeistpm/sdk';
import { Like } from 'typeorm/find-options/operator/Like';
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
  formatMarketEvent,
  getAssetId,
  getPoolStatus,
  isBaseAsset,
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

export const arbitrageBuyBurn = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { poolId, amount } = getArbitrageBuyBurnEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
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

  if (numOfPoolWts > 0 && isBaseAsset(pool.weights[numOfPoolWts - 1]!.assetId)) {
    const baseAssetWeight = +pool.weights[numOfPoolWts - 1]!.weight.toString();
    await Promise.all(
      pool.weights.map(async (wt) => {
        if (!wt) return;
        const asset = await ctx.store.get(Asset, {
          where: { assetId: wt.assetId },
        });
        if (!asset) return;
        const assetWeight = +wt!.weight.toString();
        const oldAssetQty = asset.amountInPool;
        const newAssetQty = oldAssetQty - amount;
        const oldPrice = asset.price;
        const newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);

        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        const ha = new HistoricalAsset();
        ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
        ha.assetId = asset.assetId;
        ha.newPrice = asset.price;
        ha.newAmountInPool = asset.amountInPool;
        ha.dPrice = newPrice - oldPrice;
        ha.dAmountInPool = newAssetQty - oldAssetQty;
        ha.event = item.event.name.split('.')[1];
        ha.blockNumber = block.height;
        ha.timestamp = new Date(block.timestamp);
        console.log(`[${item.event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
        await ctx.store.save<HistoricalAsset>(ha);
      })
    );
  }
};

export const arbitrageMintSell = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { poolId, amount } = getArbitrageMintSellEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
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

  if (numOfPoolWts > 0 && isBaseAsset(pool.weights[numOfPoolWts - 1]!.assetId)) {
    const baseAssetWeight = +pool.weights[numOfPoolWts - 1]!.weight.toString();
    await Promise.all(
      pool.weights.map(async (wt) => {
        if (!wt) return;
        const asset = await ctx.store.get(Asset, {
          where: { assetId: wt.assetId },
        });
        if (!asset) return;
        const assetWeight = +wt!.weight.toString();
        const oldAssetQty = asset.amountInPool;
        const newAssetQty = oldAssetQty + amount;
        const oldPrice = asset.price;
        const newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);

        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        const ha = new HistoricalAsset();
        ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
        ha.assetId = asset.assetId;
        ha.newPrice = asset.price;
        ha.newAmountInPool = asset.amountInPool;
        ha.dPrice = newPrice - oldPrice;
        ha.dAmountInPool = newAssetQty - oldAssetQty;
        ha.event = item.event.name.split('.')[1];
        ha.blockNumber = block.height;
        ha.timestamp = new Date(block.timestamp);
        console.log(`[${item.event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
        await ctx.store.save<HistoricalAsset>(ha);
      })
    );
  }
};

export const poolActive = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { poolId } = getPoolActiveEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
  });
  if (!pool) return;
  pool.status = PoolStatus.Active;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  const hp = new HistoricalPool();
  hp.id = item.event.id + '-' + pool.poolId;
  hp.poolId = pool.poolId;
  hp.status = pool.status;
  hp.event = item.event.name.split('.')[1];
  hp.blockNumber = block.height;
  hp.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
  await ctx.store.save<HistoricalPool>(hp);
};

export const poolClosed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { poolId } = getPoolClosedEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
  });
  if (!pool) return;
  pool.status = PoolStatus.Closed;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  const hp = new HistoricalPool();
  hp.id = item.event.id + '-' + pool.poolId;
  hp.poolId = pool.poolId;
  hp.status = pool.status;
  hp.event = item.event.name.split('.')[1];
  hp.blockNumber = block.height;
  hp.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
  await ctx.store.save<HistoricalPool>(hp);
};

export const poolCreate = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  let { cpep, swapPool, amount, accountId } = getPoolCreateEvent(ctx, item);

  const poolId = cpep.poolId.toString();

  if (accountId.length === 0) {
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

  const pool = new Pool();
  pool.id = item.event.id + '-' + poolId;
  pool.poolId = +poolId;
  pool.account = account;
  pool.marketId = +swapPool.marketId.toString();
  pool.status = getPoolStatus(swapPool.poolStatus);
  pool.scoringRule = swapPool.scoringRule.__kind;
  pool.swapFee = swapPool.swapFee ? swapPool.swapFee.toString() : '';
  pool.totalSubsidy = swapPool.totalSubsidy ? swapPool.totalSubsidy.toString() : '';
  pool.totalWeight = swapPool.totalWeight ? swapPool.totalWeight.toString() : '';
  pool.weights = [];
  pool.volume = BigInt(0);
  pool.createdAt = new Date(block.timestamp);
  pool.baseAsset = getAssetId(swapPool.baseAsset);
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  let baseAssetQty = pool.account.balances[pool.account.balances.length - 1].balance;
  await Promise.all(
    pool.account.balances.map(async (ab) => {
      if (ab.assetId === pool.baseAsset) baseAssetQty = ab.balance;
    })
  );

  if (swapPool.weights && isBaseAsset(swapPool.weights[swapPool.weights.length - 1][0])) {
    const baseAssetWeight = +swapPool.weights[swapPool.weights.length - 1][1].toString();
    await Promise.all(
      swapPool.weights.map(async (weight, i) => {
        const wt = new Weight();
        wt.assetId = getAssetId(weight[0]);
        wt.weight = weight[1];
        pool.weights.push(wt);

        if (isBaseAsset(weight[0])) return;

        const ab = await ctx.store.findOneBy(AccountBalance, {
          account: { accountId: accountId },
          assetId: wt.assetId,
        });
        const assetQty = ab ? +ab.balance.toString() : 10 ** 12;
        const spotPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, assetQty, +wt.weight.toString());
        const asset = new Asset();
        asset.id = item.event.id + '-' + pool.marketId + i;
        asset.assetId = wt.assetId;
        asset.price = +spotPrice.toString();
        asset.amountInPool = BigInt(assetQty);
        asset.pool = pool;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        const ha = new HistoricalAsset();
        ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
        ha.accountId = ss58.codec('zeitgeist').encode(cpep.who);
        ha.assetId = asset.assetId;
        ha.newPrice = asset.price;
        ha.newAmountInPool = asset.amountInPool;
        ha.dPrice = ha.newPrice;
        ha.dAmountInPool = ha.newAmountInPool;
        ha.event = item.event.name.split('.')[1];
        ha.blockNumber = block.height;
        ha.timestamp = new Date(block.timestamp);
        console.log(`[${item.event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
        await ctx.store.save<HistoricalAsset>(ha);
      })
    );
  }
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  const hp = new HistoricalPool();
  hp.id = item.event.id + '-' + pool.poolId;
  hp.poolId = pool.poolId;
  hp.event = item.event.name.split('.')[1];
  hp.dVolume = pool.volume;
  hp.volume = pool.volume;
  hp.status = pool.status;
  hp.blockNumber = block.height;
  hp.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
  await ctx.store.save<HistoricalPool>(hp);

  const market = await ctx.store.get(Market, {
    where: { marketId: pool.marketId },
  });
  if (!market) return;
  market.pool = pool;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket();
  hm.id = item.event.id + '-' + market.marketId;
  hm.market = market;
  hm.status = market.status;
  hm.poolId = market.pool.poolId;
  hm.event = formatMarketEvent(item.event.name);
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};

export const poolDestroyed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { poolId } = getPoolDestroyedEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
    relations: { account: true },
  });
  if (!pool) return;
  pool.status = PoolStatus.Destroyed;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  const hp = new HistoricalPool();
  hp.id = item.event.id + '-' + pool.poolId;
  hp.poolId = pool.poolId;
  hp.event = item.event.name.split('.')[1];
  hp.status = pool.status;
  hp.blockNumber = block.height;
  hp.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
  await ctx.store.save<HistoricalPool>(hp);

  const ab = await ctx.store.findOne(AccountBalance, {
    where: {
      account: { accountId: pool.account.accountId },
      assetId: pool.baseAsset,
    },
    relations: { account: true },
  });
  if (!ab) return;
  const oldBalance = ab.balance;
  const newBalance = BigInt(0);
  ab.balance = newBalance;
  console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await ctx.store.save<AccountBalance>(ab);

  const hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + ab.account.accountId.slice(-5);
  hab.accountId = ab.account.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.extrinsic = extrinsicFromEvent(item.event);
  hab.assetId = ab.assetId;
  hab.dBalance = newBalance - oldBalance;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);

  const market = await ctx.store.findOneBy(Market, {
    pool: { poolId: Number(poolId) },
  });
  if (!market) return;

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

    const ha = new HistoricalAsset();
    ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
    ha.assetId = asset.assetId;
    ha.newPrice = newPrice;
    ha.newAmountInPool = newAssetQty;
    ha.dPrice = oldPrice ? newPrice - oldPrice : null;
    ha.dAmountInPool = oldAssetQty ? newAssetQty - oldAssetQty : null;
    ha.event = item.event.name.split('.')[1];
    ha.blockNumber = block.height;
    ha.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
    await ctx.store.save<HistoricalAsset>(ha);

    const abs = await ctx.store.find(AccountBalance, {
      where: { assetId: market.outcomeAssets[i]! },
    });
    await Promise.all(
      abs.map(async (ab) => {
        const accLookupKey = ab.id.substring(0, ab.id.indexOf('-'));
        const acc = await ctx.store.get(Account, {
          where: { id: Like(`%${accLookupKey}%`) },
        });
        if (acc == null || ab.balance === BigInt(0)) return;
        const oldBalance = ab.balance;
        const newBalance = BigInt(0);
        ab.balance = newBalance;
        console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
        await ctx.store.save<AccountBalance>(ab);

        const hab = new HistoricalAccountBalance();
        hab.id = item.event.id + '-' + market.marketId + i + '-' + acc.accountId.slice(-5);
        hab.accountId = acc.accountId;
        hab.event = item.event.name.split('.')[1];
        hab.extrinsic = extrinsicFromEvent(item.event);
        hab.assetId = ab.assetId;
        hab.dBalance = newBalance - oldBalance;
        hab.blockNumber = block.height;
        hab.timestamp = new Date(block.timestamp);
        console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
        await ctx.store.save<HistoricalAccountBalance>(hab);
      })
    );
  }
};

export const poolExit = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
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

  if (pae.assets) {
    await Promise.all(
      pae.assets.map(async (a, idx) => {
        if (isBaseAsset(a)) return;
        const assetId = getAssetId(a);

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

        const ha = new HistoricalAsset();
        ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
        ha.accountId = walletId;
        ha.assetId = asset.assetId;
        ha.newPrice = asset.price;
        ha.newAmountInPool = asset.amountInPool;
        ha.dPrice = newPrice - oldPrice;
        ha.dAmountInPool = newAssetQty - oldAssetQty;
        ha.event = item.event.name.split('.')[1];
        ha.blockNumber = block.height;
        ha.timestamp = new Date(block.timestamp);
        console.log(`[${item.event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
        await ctx.store.save<HistoricalAsset>(ha);
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

        const ha = new HistoricalAsset();
        ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
        ha.accountId = walletId;
        ha.assetId = asset.assetId;
        ha.newPrice = asset.price;
        ha.newAmountInPool = asset.amountInPool;
        ha.dPrice = newPrice - oldPrice;
        ha.dAmountInPool = newAssetQty - oldAssetQty;
        ha.event = item.event.name.split('.')[1];
        ha.blockNumber = block.height;
        ha.timestamp = new Date(block.timestamp);
        console.log(`[${item.event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
        await ctx.store.save<HistoricalAsset>(ha);
      })
    );
  }
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

export const poolExitWithExactAssetAmount = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { pae, walletId } = getPoolExitWithExactAssetAmountEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +pae.cpep.poolId.toString() },
    relations: { account: { balances: true } },
  });
  if (!pool || !isBaseAsset(pae.asset)) return;
  let baseAssetQty = pool.account.balances[pool.account.balances.length - 1].balance;
  await Promise.all(
    pool.account.balances.map(async (ab) => {
      if (ab.assetId === pool.baseAsset) baseAssetQty = ab.balance;
    })
  );
  const numOfPoolWts = pool.weights.length;
  const baseAssetWeight = +pool.weights[numOfPoolWts - 1]!.weight.toString();

  await Promise.all(
    pool.weights.map(async (wt) => {
      if (!wt || isBaseAsset(wt.assetId)) return;
      const asset = await ctx.store.get(Asset, {
        where: { assetId: wt.assetId },
      });
      if (!asset) return;
      const assetWeight = +wt.weight.toString();
      const oldAssetQty = asset.amountInPool;
      const newAssetQty = oldAssetQty;
      const oldPrice = asset.price;
      const newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      const ha = new HistoricalAsset();
      ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
      ha.accountId = walletId;
      ha.assetId = asset.assetId;
      ha.newPrice = asset.price;
      ha.newAmountInPool = asset.amountInPool;
      ha.dPrice = newPrice - oldPrice;
      ha.dAmountInPool = newAssetQty - oldAssetQty;
      ha.event = item.event.name.split('.')[1];
      ha.blockNumber = block.height;
      ha.timestamp = new Date(block.timestamp);
      console.log(`[${item.event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
      await ctx.store.save<HistoricalAsset>(ha);
    })
  );
};

export const poolJoin = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
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
  if (pae.assets) {
    await Promise.all(
      pae.assets.map(async (a, idx) => {
        if (isBaseAsset(a)) return;
        const assetId = getAssetId(a);

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

        const ha = new HistoricalAsset();
        ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
        ha.accountId = walletId;
        ha.assetId = asset.assetId;
        ha.newPrice = asset.price;
        ha.newAmountInPool = asset.amountInPool;
        ha.dPrice = newPrice - oldPrice;
        ha.dAmountInPool = newAssetQty - oldAssetQty;
        ha.event = item.event.name.split('.')[1];
        ha.blockNumber = block.height;
        ha.timestamp = new Date(block.timestamp);
        console.log(`[${item.event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
        await ctx.store.save<HistoricalAsset>(ha);
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

        const ha = new HistoricalAsset();
        ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
        ha.accountId = walletId;
        ha.assetId = asset.assetId;
        ha.newPrice = asset.price;
        ha.newAmountInPool = asset.amountInPool;
        ha.dPrice = newPrice - oldPrice;
        ha.dAmountInPool = newAssetQty - oldAssetQty;
        ha.event = item.event.name.split('.')[1];
        ha.blockNumber = block.height;
        ha.timestamp = new Date(block.timestamp);
        console.log(`[${item.event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
        await ctx.store.save<HistoricalAsset>(ha);
      })
    );
  }
};

export const poolJoinWithExactAssetAmount = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { pae, walletId } = getPoolJoinWithExactAssetAmountEvent(ctx, item);

  const pool = await ctx.store.get(Pool, {
    where: { poolId: +pae.cpep.poolId.toString() },
    relations: { account: { balances: true } },
  });
  if (!pool || !isBaseAsset(pae.asset)) return;
  let baseAssetQty = pool.account.balances[pool.account.balances.length - 1].balance;
  await Promise.all(
    pool.account.balances.map(async (ab) => {
      if (ab.assetId === pool.baseAsset) baseAssetQty = ab.balance;
    })
  );
  const numOfPoolWts = pool.weights.length;

  const baseAssetWeight = +pool.weights[numOfPoolWts - 1]!.weight.toString();
  await Promise.all(
    pool.weights.map(async (wt) => {
      if (!wt || isBaseAsset(wt.assetId)) return;
      const asset = await ctx.store.get(Asset, {
        where: { assetId: wt.assetId },
      });
      if (!asset) return;
      const assetWeight = +wt.weight.toString();
      const oldAssetQty = asset.amountInPool;
      const newAssetQty = oldAssetQty;
      const oldPrice = asset.price;
      const newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      const ha = new HistoricalAsset();
      ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
      ha.accountId = walletId;
      ha.assetId = asset.assetId;
      ha.newPrice = asset.price;
      ha.newAmountInPool = asset.amountInPool;
      ha.dPrice = newPrice - oldPrice;
      ha.dAmountInPool = newAssetQty - oldAssetQty;
      ha.event = item.event.name.split('.')[1];
      ha.blockNumber = block.height;
      ha.timestamp = new Date(block.timestamp);
      console.log(`[${item.event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
      await ctx.store.save<HistoricalAsset>(ha);
    })
  );
};

export const swapExactAmountIn = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
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

  let baseAssetQty = pool.account.balances[pool.account.balances.length - 1].balance;
  await Promise.all(
    pool.account.balances.map(async (ab) => {
      if (ab.assetId === pool.baseAsset) baseAssetQty = ab.balance;
    })
  );
  let oldVolume = pool.volume;
  let newVolume = oldVolume;
  if (isBaseAsset(assetBought) || isBaseAsset(assetSold)) {
    newVolume = isBaseAsset(assetBought) ? oldVolume + assetBoughtQty : oldVolume + assetSoldQty;

    pool.volume = newVolume;
    console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
    await ctx.store.save<Pool>(pool);

    const hp = new HistoricalPool();
    hp.id = item.event.id + '-' + pool.poolId;
    hp.poolId = pool.poolId;
    hp.event = item.event.name.split('.')[1];
    hp.dVolume = newVolume - oldVolume;
    hp.volume = newVolume;
    hp.status = pool.status;
    hp.blockNumber = block.height;
    hp.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
    await ctx.store.save<HistoricalPool>(hp);
  }

  const numOfPoolWts = pool.weights.length;
  if (numOfPoolWts > 0 && isBaseAsset(pool.weights[numOfPoolWts - 1]!.assetId)) {
    const baseAssetWeight = +pool.weights[numOfPoolWts - 1]!.weight.toString();
    await Promise.all(
      pool.weights.map(async (wt) => {
        if (!wt) return;
        const asset = await ctx.store.get(Asset, {
          where: { assetId: wt.assetId },
        });
        if (!asset) return;
        const assetWeight = +wt.weight.toString();
        const oldAssetQty = asset.amountInPool;
        const oldPrice = asset.price;
        let newAssetQty = oldAssetQty;

        if (wt.assetId == getAssetId(assetBought)) {
          newAssetQty = oldAssetQty - assetBoughtQty;
        } else if (wt.assetId == getAssetId(assetSold)) {
          newAssetQty = oldAssetQty + assetSoldQty;
        }

        const newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);
        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        const ha = new HistoricalAsset();
        ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
        ha.accountId = newAssetQty == oldAssetQty ? null : walletId;
        ha.assetId = asset.assetId;
        ha.baseAssetTraded = newAssetQty == oldAssetQty ? BigInt(0) : newVolume - oldVolume;
        ha.newPrice = asset.price;
        ha.newAmountInPool = asset.amountInPool;
        ha.dPrice = newPrice - oldPrice;
        ha.dAmountInPool = newAssetQty - oldAssetQty;
        ha.event = item.event.name.split('.')[1];
        ha.blockNumber = block.height;
        ha.timestamp = new Date(block.timestamp);
        console.log(`[${item.event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
        await ctx.store.save<HistoricalAsset>(ha);
      })
    );
  }

  const sh = new HistoricalSwap();
  sh.id = item.event.id;
  sh.accountId = walletId;
  sh.assetIn = getAssetId(assetSold);
  sh.assetOut = getAssetId(assetBought);
  sh.assetAmountIn = swapEvent.assetAmountIn;
  sh.assetAmountOut = swapEvent.assetAmountOut;
  sh.event = item.event.name.split('.')[1];
  sh.extrinsic = extrinsicFromEvent(item.event);
  sh.blockNumber = block.height;
  sh.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving swap history: ${JSON.stringify(sh, null, 2)}`);
  await ctx.store.save<HistoricalSwap>(sh);
};

export const swapExactAmountOut = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
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

  let baseAssetQty = pool.account.balances[pool.account.balances.length - 1].balance;
  await Promise.all(
    pool.account.balances.map(async (ab) => {
      if (ab.assetId === pool.baseAsset) baseAssetQty = ab.balance;
    })
  );
  let oldVolume = pool.volume;
  let newVolume = oldVolume;
  if (isBaseAsset(assetBought) || isBaseAsset(assetSold)) {
    newVolume = isBaseAsset(assetBought) ? oldVolume + assetBoughtQty : oldVolume + assetSoldQty;

    pool.volume = newVolume;
    console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
    await ctx.store.save<Pool>(pool);

    const hp = new HistoricalPool();
    hp.id = item.event.id + '-' + pool.poolId;
    hp.poolId = pool.poolId;
    hp.event = item.event.name.split('.')[1];
    hp.dVolume = newVolume - oldVolume;
    hp.volume = newVolume;
    hp.status = pool.status;
    hp.blockNumber = block.height;
    hp.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
    await ctx.store.save<HistoricalPool>(hp);
  }

  const numOfPoolWts = pool.weights.length;
  if (numOfPoolWts > 0 && isBaseAsset(pool.weights[numOfPoolWts - 1]!.assetId)) {
    const baseAssetWeight = +pool.weights[numOfPoolWts - 1]!.weight.toString();
    await Promise.all(
      pool.weights.map(async (wt) => {
        if (!wt) return;
        const asset = await ctx.store.get(Asset, {
          where: { assetId: wt.assetId },
        });
        if (!asset) return;
        const assetWeight = +wt.weight.toString();
        const oldAssetQty = asset.amountInPool;
        const oldPrice = asset.price;
        let newAssetQty = oldAssetQty;

        if (wt.assetId == getAssetId(assetBought)) {
          newAssetQty = oldAssetQty - assetBoughtQty;
        } else if (wt.assetId == getAssetId(assetSold)) {
          newAssetQty = oldAssetQty + assetSoldQty;
        }

        const newPrice = calcSpotPrice(+baseAssetQty.toString(), baseAssetWeight, +newAssetQty.toString(), assetWeight);
        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        const ha = new HistoricalAsset();
        ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
        ha.accountId = newAssetQty == oldAssetQty ? null : walletId;
        ha.assetId = asset.assetId;
        ha.baseAssetTraded = newAssetQty == oldAssetQty ? BigInt(0) : newVolume - oldVolume;
        ha.newPrice = asset.price;
        ha.newAmountInPool = asset.amountInPool;
        ha.dPrice = newPrice - oldPrice;
        ha.dAmountInPool = newAssetQty - oldAssetQty;
        ha.event = item.event.name.split('.')[1];
        ha.blockNumber = block.height;
        ha.timestamp = new Date(block.timestamp);
        console.log(`[${item.event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
        await ctx.store.save<HistoricalAsset>(ha);
      })
    );
  }

  const sh = new HistoricalSwap();
  sh.id = item.event.id;
  sh.accountId = walletId;
  sh.assetIn = getAssetId(assetSold);
  sh.assetOut = getAssetId(assetBought);
  sh.assetAmountIn = swapEvent.assetAmountIn;
  sh.assetAmountOut = swapEvent.assetAmountOut;
  sh.event = item.event.name.split('.')[1];
  sh.extrinsic = extrinsicFromEvent(item.event);
  sh.blockNumber = block.height;
  sh.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving swap history: ${JSON.stringify(sh, null, 2)}`);
  await ctx.store.save<HistoricalSwap>(sh);
};
