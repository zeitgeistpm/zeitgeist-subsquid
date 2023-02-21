import { SubstrateBlock } from '@subsquid/substrate-processor';
import * as ss58 from '@subsquid/ss58';
import { Like } from 'typeorm/find-options/operator/Like';
import {
  Account,
  AccountBalance,
  Asset,
  HistoricalAccountBalance,
  HistoricalAsset,
  HistoricalMarket,
  HistoricalPool,
  Market,
  Pool,
  Weight,
} from '../../model';
import { calcSpotPrice, getAssetId } from '../helper';
import {
  getArbitrageBuyBurnEvent,
  getArbitrageMintSellEvent,
  getPoolActiveEvent,
  getPoolClosedEvent,
  getPoolCreateEvent,
  getPoolDestroyedEvent,
  getPoolExitEvent,
  getPoolExitWithExactAssetAmountEvent,
  getPoolJoinEvent,
  getPoolJoinWithExactAssetAmountEvent,
  getSwapExactAmountInEvent,
  getSwapExactAmountOutEvent,
} from './types';
import { Ctx, EventItem } from '../../processor';

export const arbitrageBuyBurn = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { poolId, amount } = getArbitrageBuyBurnEvent(ctx, item);

  let pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
  });
  if (!pool) return;

  const oldZtgQty = pool.ztgQty;
  const newZtgQty = oldZtgQty + amount;
  pool.ztgQty = newZtgQty;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  let hp = new HistoricalPool();
  hp.id = item.event.id + '-' + pool.poolId;
  hp.poolId = pool.poolId;
  hp.event = item.event.name.split('.')[1];
  hp.ztgQty = pool.ztgQty;
  hp.poolStatus = pool.poolStatus;
  hp.blockNumber = block.height;
  hp.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
  await ctx.store.save<HistoricalPool>(hp);

  const numOfPoolWts = pool.weights.length;
  if (numOfPoolWts > 0 && pool.weights[numOfPoolWts - 1]!.assetId == 'Ztg') {
    const ztgWeight = +pool.weights[numOfPoolWts - 1]!.len.toString();
    await Promise.all(
      pool.weights.map(async (wt) => {
        if (!wt) return;
        const asset = await ctx.store.get(Asset, {
          where: { assetId: wt.assetId },
        });
        if (!asset || !asset.amountInPool || !asset.price) return;

        const assetWeight = +wt!.len.toString();
        const oldAssetQty = asset.amountInPool;
        const newAssetQty = oldAssetQty - amount;
        const oldPrice = asset.price;
        const newPrice = calcSpotPrice(+newZtgQty.toString(), ztgWeight, +newAssetQty.toString(), assetWeight);

        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        let ha = new HistoricalAsset();
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

  let pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
  });
  if (!pool) return;

  const oldZtgQty = pool.ztgQty;
  const newZtgQty = oldZtgQty - amount;
  pool.ztgQty = newZtgQty;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  let hp = new HistoricalPool();
  hp.id = item.event.id + '-' + pool.poolId;
  hp.poolId = pool.poolId;
  hp.event = item.event.name.split('.')[1];
  hp.ztgQty = pool.ztgQty;
  hp.poolStatus = pool.poolStatus;
  hp.blockNumber = block.height;
  hp.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
  await ctx.store.save<HistoricalPool>(hp);

  const numOfPoolWts = pool.weights.length;
  if (numOfPoolWts > 0 && pool.weights[numOfPoolWts - 1]!.assetId == 'Ztg') {
    const ztgWeight = +pool.weights[numOfPoolWts - 1]!.len.toString();
    await Promise.all(
      pool.weights.map(async (wt) => {
        if (!wt) return;
        const asset = await ctx.store.get(Asset, {
          where: { assetId: wt.assetId },
        });
        if (!asset || !asset.amountInPool || !asset.price) return;

        const assetWeight = +wt!.len.toString();
        const oldAssetQty = asset.amountInPool;
        const newAssetQty = oldAssetQty + amount;
        const oldPrice = asset.price;
        const newPrice = calcSpotPrice(+newZtgQty.toString(), ztgWeight, +newAssetQty.toString(), assetWeight);

        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        let ha = new HistoricalAsset();
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

  let pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
  });
  if (!pool) return;

  pool.poolStatus = 'Active';
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  let hp = new HistoricalPool();
  hp.id = item.event.id + '-' + pool.poolId;
  hp.poolId = pool.poolId;
  hp.poolStatus = pool.poolStatus;
  hp.event = item.event.name.split('.')[1];
  hp.blockNumber = block.height;
  hp.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
  await ctx.store.save<HistoricalPool>(hp);
};

export const poolClosed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { poolId } = getPoolClosedEvent(ctx, item);

  let pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
  });
  if (!pool) return;

  pool.poolStatus = 'Closed';
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  let hp = new HistoricalPool();
  hp.id = item.event.id + '-' + pool.poolId;
  hp.poolId = pool.poolId;
  hp.poolStatus = pool.poolStatus;
  hp.event = item.event.name.split('.')[1];
  hp.blockNumber = block.height;
  hp.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
  await ctx.store.save<HistoricalPool>(hp);
};

export const poolCreate = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  let { cpep, swapPool, amount, accountId } = getPoolCreateEvent(ctx, item);

  if (accountId.length === 0 && swapPool.weights) {
    const hab = await ctx.store.findOneBy(HistoricalAccountBalance, {
      assetId: getAssetId(swapPool.weights[0][0]),
      event: 'EndowedTransferred',
      blockNumber: block.height,
    });
    accountId = hab ? hab.accountId : accountId;
  }

  let pool = new Pool();
  pool.id = item.event.id + '-' + cpep.poolId;
  pool.poolId = +cpep.poolId.toString();
  pool.accountId = accountId;
  pool.marketId = +swapPool.marketId.toString();
  pool.poolStatus = swapPool.poolStatus.__kind;
  pool.scoringRule = swapPool.scoringRule.__kind;
  pool.swapFee = swapPool.swapFee ? swapPool.swapFee.toString() : '';
  pool.totalSubsidy = swapPool.totalSubsidy ? swapPool.totalSubsidy.toString() : '';
  pool.totalWeight = swapPool.totalWeight ? swapPool.totalWeight.toString() : '';
  pool.weights = [];
  pool.ztgQty = amount !== BigInt(0) ? amount : BigInt(10 ** 12);
  pool.volume = BigInt(0);
  pool.createdAt = new Date(block.timestamp);
  pool.baseAsset = swapPool.baseAsset.__kind;

  let acc = await ctx.store.get(Account, {
    where: { accountId: pool.accountId },
  });
  if (acc) {
    acc.poolId = pool.poolId;
    console.log(`[${item.event.name}] Saving account: ${JSON.stringify(acc, null, 2)}`);
    await ctx.store.save<Account>(acc);
  }

  if (swapPool.weights && swapPool.weights[swapPool.weights.length - 1][0].__kind == 'Ztg') {
    const ztgWeight = +swapPool.weights[swapPool.weights.length - 1][1].toString();
    await Promise.all(
      swapPool.weights.map(async (wt) => {
        let weight = new Weight();
        weight.assetId = getAssetId(wt[0]);
        weight.len = wt[1];
        pool.weights.push(weight);

        if (weight.assetId.length > 5) {
          let asset = await ctx.store.get(Asset, {
            where: { assetId: weight.assetId },
          });
          if (!asset) return;

          const ab = await ctx.store.findOneBy(AccountBalance, {
            account: { accountId: accountId },
            assetId: asset.assetId,
          });
          const assetQty = ab ? +ab.balance.toString() : 10 ** 12;

          const spotPrice = calcSpotPrice(+pool.ztgQty.toString(), ztgWeight, assetQty, +weight.len.toString());
          asset.poolId = pool.poolId;
          asset.price = +spotPrice.toString();
          asset.amountInPool = BigInt(assetQty);
          console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
          await ctx.store.save<Asset>(asset);

          let ha = new HistoricalAsset();
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
        }
      })
    );
  }
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  let hp = new HistoricalPool();
  hp.id = item.event.id + '-' + pool.poolId;
  hp.poolId = pool.poolId;
  hp.event = item.event.name.split('.')[1];
  hp.ztgQty = pool.ztgQty;
  hp.dVolume = pool.volume;
  hp.volume = pool.volume;
  hp.poolStatus = pool.poolStatus;
  hp.blockNumber = block.height;
  hp.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
  await ctx.store.save<HistoricalPool>(hp);

  let market = await ctx.store.get(Market, {
    where: { marketId: pool.marketId },
  });
  if (market) {
    market.pool = pool;
    console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
    await ctx.store.save<Market>(market);

    let hm = new HistoricalMarket();
    hm.id = item.event.id + '-' + market.marketId;
    hm.marketId = market.marketId;
    hm.status = market.status;
    hm.poolId = market.pool.poolId;
    hm.event = item.event.name.split('.')[1];
    hm.blockNumber = block.height;
    hm.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
    await ctx.store.save<HistoricalMarket>(hm);
  }
};

export const poolDestroyed = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { poolId } = getPoolDestroyedEvent(ctx, item);

  let pool = await ctx.store.get(Pool, {
    where: { poolId: +poolId.toString() },
  });
  if (!pool) return;

  pool.poolStatus = 'Destroyed';
  pool.ztgQty = BigInt(0);
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  let hp = new HistoricalPool();
  hp.id = item.event.id + '-' + pool.poolId;
  hp.poolId = pool.poolId;
  hp.poolStatus = pool.poolStatus;
  hp.ztgQty = pool.ztgQty;
  hp.event = item.event.name.split('.')[1];
  hp.poolStatus = pool.poolStatus;
  hp.blockNumber = block.height;
  hp.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
  await ctx.store.save<HistoricalPool>(hp);

  let acc = await ctx.store.get(Account, {
    where: { accountId: pool.accountId! },
  });
  if (!acc) return;

  let ab = await ctx.store.findOneBy(AccountBalance, {
    account: { accountId: acc.accountId },
    assetId: 'Ztg',
  });
  if (!ab) return;

  const oldBalance = ab.balance;
  const newBalance = BigInt(0);
  ab.balance = newBalance;
  console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
  await ctx.store.save<AccountBalance>(ab);

  let hab = new HistoricalAccountBalance();
  hab.id = item.event.id + '-' + acc.accountId.substring(acc.accountId.length - 5);
  hab.accountId = acc.accountId;
  hab.event = item.event.name.split('.')[1];
  hab.assetId = ab.assetId;
  hab.dBalance = newBalance - oldBalance;
  hab.balance = newBalance;
  hab.blockNumber = block.height;
  hab.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
  await ctx.store.save<HistoricalAccountBalance>(hab);

  const market = await ctx.store.findOneBy(Market, {
    pool: { poolId: Number(poolId) },
  });
  if (!market) return;

  const numOfOutcomeAssets = market.outcomeAssets.length;
  if (numOfOutcomeAssets > 0) {
    for (let i = 0; i < numOfOutcomeAssets; i++) {
      let asset = await ctx.store.get(Asset, {
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

      let ha = new HistoricalAsset();
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
          const keyword = ab.id.substring(ab.id.lastIndexOf('-') + 1, ab.id.length);
          let acc = await ctx.store.get(Account, {
            where: { id: Like(`%${keyword}%`) },
          });
          if (acc != null && ab.balance > BigInt(0)) {
            const oldBalance = ab.balance;
            const newBalance = BigInt(0);

            ab.balance = newBalance;
            console.log(`[${item.event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
            await ctx.store.save<AccountBalance>(ab);

            let hab = new HistoricalAccountBalance();
            hab.id = item.event.id + '-' + acc.accountId.substring(acc.accountId.length - 5);
            hab.accountId = acc.accountId;
            hab.event = item.event.name.split('.')[1];
            hab.assetId = ab.assetId;
            hab.dBalance = newBalance - oldBalance;
            hab.balance = newBalance;
            hab.blockNumber = block.height;
            hab.timestamp = new Date(block.timestamp);
            console.log(`[${item.event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
            await ctx.store.save<HistoricalAccountBalance>(hab);
          }
        })
      );
    }
  }
};

export const poolExit = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { pae, walletId } = getPoolExitEvent(ctx, item);

  let pool = await ctx.store.get(Pool, {
    where: { poolId: +pae.cpep.poolId.toString() },
  });
  if (!pool) return;

  const market = await ctx.store.get(Market, {
    where: { pool: { poolId: pool.poolId } },
  });
  if (!market) return;

  const oldZtgQty = pool.ztgQty;
  const newZtgQty = oldZtgQty - BigInt(pae.transferred[pae.transferred.length - 1].toString());
  pool.ztgQty = newZtgQty;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  let hp = new HistoricalPool();
  hp.id = item.event.id + '-' + pool.poolId;
  hp.poolId = pool.poolId;
  hp.event = item.event.name.split('.')[1];
  hp.ztgQty = pool.ztgQty;
  hp.poolStatus = pool.poolStatus;
  hp.blockNumber = block.height;
  hp.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
  await ctx.store.save<HistoricalPool>(hp);

  const numOfPoolWts = pool.weights.length;
  const ztgWeight = +pool.weights[numOfPoolWts - 1]!.len.toString();
  if (pae.assets) {
    await Promise.all(
      pae.assets.map(async (a, idx) => {
        const assetId = getAssetId(a);
        if (assetId == 'Ztg') return;

        let asset = await ctx.store.get(Asset, { where: { assetId: assetId } });
        if (!asset || !asset.amountInPool || !asset.price) return;

        let assetWeight = 0;
        for (let i = 0; i < numOfPoolWts; i++) {
          if (pool!.weights[i]!.assetId == assetId) {
            assetWeight = +pool!.weights[i]!.len.toString();
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
          newPrice = calcSpotPrice(+newZtgQty.toString(), ztgWeight, +newAssetQty.toString(), assetWeight);
        }
        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        let ha = new HistoricalAsset();
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
        let asset = await ctx.store.get(Asset, {
          where: { assetId: wt!.assetId },
        });
        if (!asset || !asset.amountInPool || !asset.price) return;

        const assetWeight = +wt!.len.toString();
        const oldAssetQty = asset.amountInPool;
        const newAssetQty = oldAssetQty - BigInt(pae.transferred[idx].toString());
        const oldPrice = asset.price;
        let newPrice = oldPrice;
        if (oldPrice > 0 && oldPrice < 1) {
          newPrice = calcSpotPrice(+newZtgQty.toString(), ztgWeight, +newAssetQty.toString(), assetWeight);
        }
        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        let ha = new HistoricalAsset();
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

export const poolExitWithExactAssetAmount = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { pae, walletId } = getPoolExitWithExactAssetAmountEvent(ctx, item);

  let pool = await ctx.store.get(Pool, {
    where: { poolId: +pae.cpep.poolId.toString() },
  });
  if (!pool || pae.asset.__kind !== 'Ztg') return;

  const oldZtgQty = pool.ztgQty;
  const newZtgQty = oldZtgQty - BigInt(pae.transferred.toString());
  pool.ztgQty = newZtgQty;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  let hp = new HistoricalPool();
  hp.id = item.event.id + '-' + pool.poolId;
  hp.poolId = pool.poolId;
  hp.event = item.event.name.split('.')[1];
  hp.ztgQty = pool.ztgQty;
  hp.poolStatus = pool.poolStatus;
  hp.blockNumber = block.height;
  hp.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
  await ctx.store.save<HistoricalPool>(hp);

  const numOfPoolWts = pool.weights.length;
  const ztgWeight = +pool.weights[numOfPoolWts - 1]!.len.toString();
  await Promise.all(
    pool.weights.map(async (wt) => {
      if (!wt || wt.assetId.includes('Ztg')) return;
      let asset = await ctx.store.get(Asset, {
        where: { assetId: wt.assetId },
      });
      if (!asset || !asset.amountInPool || !asset.price) return;

      const assetWeight = +wt.len.toString();
      const oldAssetQty = asset.amountInPool;
      const newAssetQty = oldAssetQty;
      const oldPrice = asset.price;
      const newPrice = calcSpotPrice(+newZtgQty.toString(), ztgWeight, +newAssetQty.toString(), assetWeight);

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      let ha = new HistoricalAsset();
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

  let pool = await ctx.store.get(Pool, {
    where: { poolId: +pae.cpep.poolId.toString() },
  });
  if (!pool) return;

  const oldZtgQty = pool.ztgQty;
  const newZtgQty = oldZtgQty + BigInt(pae.transferred[pae.transferred.length - 1].toString());
  pool.ztgQty = newZtgQty;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  let hp = new HistoricalPool();
  hp.id = item.event.id + '-' + pool.poolId;
  hp.poolId = pool.poolId;
  hp.event = item.event.name.split('.')[1];
  hp.ztgQty = pool.ztgQty;
  hp.poolStatus = pool.poolStatus;
  hp.blockNumber = block.height;
  hp.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
  await ctx.store.save<HistoricalPool>(hp);

  const numOfPoolWts = pool.weights.length;
  const ztgWeight = +pool.weights[numOfPoolWts - 1]!.len.toString();
  if (pae.assets) {
    await Promise.all(
      pae.assets.map(async (a, idx) => {
        const assetId = getAssetId(a);
        if (assetId == 'Ztg') return;

        let asset = await ctx.store.get(Asset, { where: { assetId: assetId } });
        if (!asset || !asset.amountInPool || !asset.price) return;

        let assetWeight = 0;
        for (let i = 0; i < numOfPoolWts; i++) {
          if (pool!.weights[i]!.assetId == assetId) {
            assetWeight = +pool!.weights[i]!.len.toString();
          }
        }
        if (assetWeight == 0) {
          console.error(`Coudn't find weight for the asset: ${assetId}`);
          return;
        }

        const oldAssetQty = asset.amountInPool;
        const newAssetQty = oldAssetQty + BigInt(pae.transferred[idx].toString());
        const oldPrice = asset.price;
        const newPrice = calcSpotPrice(+newZtgQty.toString(), ztgWeight, +newAssetQty.toString(), assetWeight);

        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        let ha = new HistoricalAsset();
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
        let asset = await ctx.store.get(Asset, {
          where: { assetId: wt!.assetId },
        });
        if (!asset || !asset.amountInPool || !asset.price) return;

        const assetWeight = +wt!.len.toString();
        const oldAssetQty = asset.amountInPool;
        const newAssetQty = oldAssetQty + BigInt(pae.transferred[idx].toString());
        const oldPrice = asset.price;
        const newPrice = calcSpotPrice(+newZtgQty.toString(), ztgWeight, +newAssetQty.toString(), assetWeight);

        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        let ha = new HistoricalAsset();
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

  let pool = await ctx.store.get(Pool, {
    where: { poolId: +pae.cpep.poolId.toString() },
  });
  if (!pool || pae.asset.__kind !== 'Ztg') return;

  const oldZtgQty = pool.ztgQty;
  const newZtgQty = oldZtgQty + BigInt(pae.transferred.toString());
  pool.ztgQty = newZtgQty;
  console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
  await ctx.store.save<Pool>(pool);

  let hp = new HistoricalPool();
  hp.id = item.event.id + '-' + pool.poolId;
  hp.poolId = pool.poolId;
  hp.event = item.event.name.split('.')[1];
  hp.ztgQty = pool.ztgQty;
  hp.poolStatus = pool.poolStatus;
  hp.blockNumber = block.height;
  hp.timestamp = new Date(block.timestamp);
  console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
  await ctx.store.save<HistoricalPool>(hp);

  const numOfPoolWts = pool.weights.length;
  const ztgWeight = +pool.weights[numOfPoolWts - 1]!.len.toString();
  await Promise.all(
    pool.weights.map(async (wt) => {
      if (!wt || wt.assetId.includes('Ztg')) return;
      let asset = await ctx.store.get(Asset, {
        where: { assetId: wt.assetId },
      });
      if (!asset || !asset.amountInPool || !asset.price) return;

      const assetWeight = +wt.len.toString();
      const oldAssetQty = asset.amountInPool;
      const newAssetQty = oldAssetQty;
      const oldPrice = asset.price;
      const newPrice = calcSpotPrice(+newZtgQty.toString(), ztgWeight, +newAssetQty.toString(), assetWeight);

      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      let ha = new HistoricalAsset();
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

  let pool = await ctx.store.get(Pool, {
    where: { poolId: +swapEvent.cpep.poolId.toString() },
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

  let ztgQty = pool.ztgQty;
  let oldVolume = pool.volume;
  let newVolume = oldVolume;
  if (assetBought.__kind == 'Ztg' || assetSold.__kind == 'Ztg') {
    ztgQty = assetBought.__kind == 'Ztg' ? ztgQty - assetBoughtQty : ztgQty + assetSoldQty;
    newVolume = assetBought.__kind == 'Ztg' ? oldVolume + assetBoughtQty : oldVolume + assetSoldQty;

    pool.ztgQty = ztgQty;
    pool.volume = newVolume;
    console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
    await ctx.store.save<Pool>(pool);

    let hp = new HistoricalPool();
    hp.id = item.event.id + '-' + pool.poolId;
    hp.poolId = pool.poolId;
    hp.event = item.event.name.split('.')[1];
    hp.ztgQty = pool.ztgQty;
    hp.dVolume = newVolume - oldVolume;
    hp.volume = newVolume;
    hp.poolStatus = pool.poolStatus;
    hp.blockNumber = block.height;
    hp.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
    await ctx.store.save<HistoricalPool>(hp);
  }

  const numOfPoolWts = pool.weights.length;
  if (numOfPoolWts > 0 && pool.weights[numOfPoolWts - 1]!.assetId == 'Ztg') {
    const ztgWeight = +pool.weights[numOfPoolWts - 1]!.len.toString();
    await Promise.all(
      pool.weights.map(async (wt) => {
        if (!wt) return;
        const asset = await ctx.store.get(Asset, {
          where: { assetId: wt.assetId },
        });
        if (!asset || !asset.amountInPool || !asset.price) return;

        const assetWeight = +wt.len.toString();
        const oldAssetQty = asset.amountInPool;
        const oldPrice = asset.price;
        let newAssetQty = oldAssetQty;

        if (wt.assetId == getAssetId(assetBought)) {
          newAssetQty = oldAssetQty - assetBoughtQty;
        } else if (wt.assetId == getAssetId(assetSold)) {
          newAssetQty = oldAssetQty + assetSoldQty;
        }

        const newPrice = calcSpotPrice(+ztgQty.toString(), ztgWeight, +newAssetQty.toString(), assetWeight);
        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        let ha = new HistoricalAsset();
        ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
        ha.accountId = newAssetQty == oldAssetQty ? null : walletId;
        ha.assetId = asset.assetId;
        ha.ztgTraded = newAssetQty == oldAssetQty ? BigInt(0) : newVolume - oldVolume;
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

export const swapExactAmountOut = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { swapEvent, walletId } = getSwapExactAmountOutEvent(ctx, item);

  let pool = await ctx.store.get(Pool, {
    where: { poolId: +swapEvent.cpep.poolId.toString() },
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

  let ztgQty = pool.ztgQty;
  let oldVolume = pool.volume;
  let newVolume = oldVolume;
  if (assetBought.__kind == 'Ztg' || assetSold.__kind == 'Ztg') {
    ztgQty = assetBought.__kind == 'Ztg' ? ztgQty - assetBoughtQty : ztgQty + assetSoldQty;
    newVolume = assetBought.__kind == 'Ztg' ? oldVolume + assetBoughtQty : oldVolume + assetSoldQty;

    pool.ztgQty = ztgQty;
    pool.volume = newVolume;
    console.log(`[${item.event.name}] Saving pool: ${JSON.stringify(pool, null, 2)}`);
    await ctx.store.save<Pool>(pool);

    let hp = new HistoricalPool();
    hp.id = item.event.id + '-' + pool.poolId;
    hp.poolId = pool.poolId;
    hp.event = item.event.name.split('.')[1];
    hp.ztgQty = pool.ztgQty;
    hp.dVolume = newVolume - oldVolume;
    hp.volume = newVolume;
    hp.poolStatus = pool.poolStatus;
    hp.blockNumber = block.height;
    hp.timestamp = new Date(block.timestamp);
    console.log(`[${item.event.name}] Saving historical pool: ${JSON.stringify(hp, null, 2)}`);
    await ctx.store.save<HistoricalPool>(hp);
  }

  const numOfPoolWts = pool.weights.length;
  if (numOfPoolWts > 0 && pool.weights[numOfPoolWts - 1]!.assetId == 'Ztg') {
    const ztgWeight = +pool.weights[numOfPoolWts - 1]!.len.toString();
    await Promise.all(
      pool.weights.map(async (wt) => {
        if (!wt) return;
        const asset = await ctx.store.get(Asset, {
          where: { assetId: wt.assetId },
        });
        if (!asset || !asset.amountInPool || !asset.price) return;

        const assetWeight = +wt.len.toString();
        const oldAssetQty = asset.amountInPool;
        const oldPrice = asset.price;
        let newAssetQty = oldAssetQty;

        if (wt.assetId == getAssetId(assetBought)) {
          newAssetQty = oldAssetQty - assetBoughtQty;
        } else if (wt.assetId == getAssetId(assetSold)) {
          newAssetQty = oldAssetQty + assetSoldQty;
        }

        const newPrice = calcSpotPrice(+ztgQty.toString(), ztgWeight, +newAssetQty.toString(), assetWeight);
        asset.price = newPrice;
        asset.amountInPool = newAssetQty;
        console.log(`[${item.event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
        await ctx.store.save<Asset>(asset);

        let ha = new HistoricalAsset();
        ha.id = item.event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
        ha.accountId = newAssetQty == oldAssetQty ? null : walletId;
        ha.assetId = asset.assetId;
        ha.ztgTraded = newAssetQty == oldAssetQty ? BigInt(0) : newVolume - oldVolume;
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
