import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Like } from 'typeorm';
import {
  Account,
  AccountBalance,
  Asset,
  HistoricalAccountBalance,
  HistoricalAsset,
  HistoricalMarket,
  Market,
  MarketEvent,
  MarketStatus,
} from '../../model';
import { Ctx } from '../../processor';

export const resolveMarkets_167323 = async (ctx: Ctx, block: SubstrateBlock) => {
  const event = {
    id: '0000167323-000000-04acf',
    name: 'PostHooks.MarketResolved',
  };

  const market = await ctx.store.get(Market, { where: { marketId: 224 } });
  if (!market) return;
  market.resolvedOutcome = '2';
  market.status = MarketStatus.Resolved;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.resolvedOutcome = market.resolvedOutcome;
  hm.event = MarketEvent.MarketResolved;
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);

  for (let i = 0; i < market.outcomeAssets.length; i++) {
    let asset = await ctx.store.get(Asset, {
      where: { assetId: market.outcomeAssets[i]! },
    });
    if (!asset) return;
    const oldPrice = asset.price;
    const oldAssetQty = asset.amountInPool;
    let newPrice = oldPrice;
    let newAssetQty = oldAssetQty;

    if (market.marketType.scalar) {
      const lowerBound = Number(market.marketType.scalar[0]);
      const upperBound = Number(market.marketType.scalar[1]);
      if (asset.assetId.includes('Long')) newPrice = (+market.resolvedOutcome - lowerBound) / (upperBound - lowerBound);
      else if (asset.assetId.includes('Short'))
        newPrice = (upperBound - +market.resolvedOutcome) / (upperBound - lowerBound);
    } else {
      newPrice = i == +market.resolvedOutcome ? 1 : 0;
      newAssetQty = i == +market.resolvedOutcome ? oldAssetQty : BigInt(0);
    }
    asset.price = newPrice;
    asset.amountInPool = newAssetQty;
    console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
    await ctx.store.save<Asset>(asset);

    let ha = new HistoricalAsset();
    ha.id = event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
    ha.assetId = asset.assetId;
    ha.newPrice = newPrice;
    ha.newAmountInPool = newAssetQty;
    ha.dPrice = newPrice - oldPrice;
    ha.dAmountInPool = newAssetQty - oldAssetQty;
    ha.event = event.name.split('.')[1];
    ha.blockNumber = block.height;
    ha.timestamp = new Date(block.timestamp);
    console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
    await ctx.store.save<HistoricalAsset>(ha);

    const abs = await ctx.store.find(AccountBalance, {
      where: { assetId: asset.assetId },
    });
    await Promise.all(
      abs.map(async (ab) => {
        const keyword = ab.id.substring(ab.id.lastIndexOf('-') + 1, ab.id.length);
        let acc = await ctx.store.get(Account, {
          where: { id: Like(`%${keyword}%`) },
        });
        if (!acc || ab.balance === BigInt(0)) return;
        const oldBalance = ab.balance;
        if (market.marketType.categorical) ab.balance = i == +market.resolvedOutcome! ? ab.balance : BigInt(0);
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
        await ctx.store.save<AccountBalance>(ab);

        let hab = new HistoricalAccountBalance();
        hab.id = event.id + '-' + acc.accountId.substring(acc.accountId.length - 5);
        hab.accountId = acc.accountId;
        hab.event = event.name.split('.')[1];
        hab.assetId = ab.assetId;
        hab.dBalance = ab.balance - oldBalance;
        hab.blockNumber = block.height;
        hab.timestamp = new Date(block.timestamp);
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
        await ctx.store.save<HistoricalAccountBalance>(hab);
      })
    );
  }
};

export const resolveMarkets_178290 = async (ctx: Ctx, block: SubstrateBlock) => {
  const event = {
    id: '0000178290-000000-58224',
    name: 'PostHooks.MarketResolved',
  };

  const market = await ctx.store.get(Market, { where: { marketId: 222 } });
  if (!market) return;
  market.resolvedOutcome = '2';
  market.status = MarketStatus.Resolved;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.resolvedOutcome = market.resolvedOutcome;
  hm.event = MarketEvent.MarketResolved;
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);

  for (let i = 0; i < market.outcomeAssets.length; i++) {
    let asset = await ctx.store.get(Asset, {
      where: { assetId: market.outcomeAssets[i]! },
    });
    if (!asset) return;
    const oldPrice = asset.price;
    const oldAssetQty = asset.amountInPool;
    let newPrice = oldPrice;
    let newAssetQty = oldAssetQty;

    if (market.marketType.scalar) {
      const lowerBound = Number(market.marketType.scalar[0]);
      const upperBound = Number(market.marketType.scalar[1]);
      if (asset.assetId.includes('Long')) newPrice = (+market.resolvedOutcome - lowerBound) / (upperBound - lowerBound);
      else if (asset.assetId.includes('Short'))
        newPrice = (upperBound - +market.resolvedOutcome) / (upperBound - lowerBound);
    } else {
      newPrice = i == +market.resolvedOutcome ? 1 : 0;
      newAssetQty = i == +market.resolvedOutcome ? oldAssetQty : BigInt(0);
    }
    asset.price = newPrice;
    asset.amountInPool = newAssetQty;
    console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
    await ctx.store.save<Asset>(asset);

    let ha = new HistoricalAsset();
    ha.id = event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
    ha.assetId = asset.assetId;
    ha.newPrice = newPrice;
    ha.newAmountInPool = newAssetQty;
    ha.dPrice = newPrice - oldPrice;
    ha.dAmountInPool = newAssetQty - oldAssetQty;
    ha.event = event.name.split('.')[1];
    ha.blockNumber = block.height;
    ha.timestamp = new Date(block.timestamp);
    console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
    await ctx.store.save<HistoricalAsset>(ha);

    const abs = await ctx.store.find(AccountBalance, {
      where: { assetId: asset.assetId },
    });
    await Promise.all(
      abs.map(async (ab) => {
        const keyword = ab.id.substring(ab.id.lastIndexOf('-') + 1, ab.id.length);
        let acc = await ctx.store.get(Account, {
          where: { id: Like(`%${keyword}%`) },
        });
        if (!acc || ab.balance === BigInt(0)) return;
        const oldBalance = ab.balance;
        if (market.marketType.categorical) ab.balance = i == +market.resolvedOutcome! ? ab.balance : BigInt(0);
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
        await ctx.store.save<AccountBalance>(ab);

        let hab = new HistoricalAccountBalance();
        hab.id = event.id + '-' + acc.accountId.substring(acc.accountId.length - 5);
        hab.accountId = acc.accountId;
        hab.event = event.name.split('.')[1];
        hab.assetId = ab.assetId;
        hab.dBalance = ab.balance - oldBalance;
        hab.blockNumber = block.height;
        hab.timestamp = new Date(block.timestamp);
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
        await ctx.store.save<HistoricalAccountBalance>(hab);
      })
    );
  }
};

export const resolveMarkets_179524 = async (ctx: Ctx, block: SubstrateBlock) => {
  const event = {
    id: '0000179524-000000-79a82',
    name: 'PostHooks.MarketResolved',
  };

  const market = await ctx.store.get(Market, { where: { marketId: 22 } });
  if (!market) return;
  market.resolvedOutcome = '0';
  market.status = MarketStatus.Resolved;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.resolvedOutcome = market.resolvedOutcome;
  hm.event = MarketEvent.MarketResolved;
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);

  for (let i = 0; i < market.outcomeAssets.length; i++) {
    let asset = await ctx.store.get(Asset, {
      where: { assetId: market.outcomeAssets[i]! },
    });
    if (!asset) return;
    const oldPrice = asset.price;
    const oldAssetQty = asset.amountInPool;
    let newPrice = oldPrice;
    let newAssetQty = oldAssetQty;

    if (market.marketType.scalar) {
      const lowerBound = Number(market.marketType.scalar[0]);
      const upperBound = Number(market.marketType.scalar[1]);
      if (asset.assetId.includes('Long')) newPrice = (+market.resolvedOutcome - lowerBound) / (upperBound - lowerBound);
      else if (asset.assetId.includes('Short'))
        newPrice = (upperBound - +market.resolvedOutcome) / (upperBound - lowerBound);
    } else {
      newPrice = i == +market.resolvedOutcome ? 1 : 0;
      newAssetQty = i == +market.resolvedOutcome ? oldAssetQty : BigInt(0);
    }
    asset.price = newPrice;
    asset.amountInPool = newAssetQty;
    console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
    await ctx.store.save<Asset>(asset);

    let ha = new HistoricalAsset();
    ha.id = event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
    ha.assetId = asset.assetId;
    ha.newPrice = newPrice;
    ha.newAmountInPool = newAssetQty;
    ha.dPrice = newPrice - oldPrice;
    ha.dAmountInPool = newAssetQty - oldAssetQty;
    ha.event = event.name.split('.')[1];
    ha.blockNumber = block.height;
    ha.timestamp = new Date(block.timestamp);
    console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
    await ctx.store.save<HistoricalAsset>(ha);

    const abs = await ctx.store.find(AccountBalance, {
      where: { assetId: asset.assetId },
    });
    await Promise.all(
      abs.map(async (ab) => {
        const keyword = ab.id.substring(ab.id.lastIndexOf('-') + 1, ab.id.length);
        let acc = await ctx.store.get(Account, {
          where: { id: Like(`%${keyword}%`) },
        });
        if (!acc || ab.balance === BigInt(0)) return;
        const oldBalance = ab.balance;
        if (market.marketType.categorical) ab.balance = i == +market.resolvedOutcome! ? ab.balance : BigInt(0);
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
        await ctx.store.save<AccountBalance>(ab);

        let hab = new HistoricalAccountBalance();
        hab.id = event.id + '-' + acc.accountId.substring(acc.accountId.length - 5);
        hab.accountId = acc.accountId;
        hab.event = event.name.split('.')[1];
        hab.assetId = ab.assetId;
        hab.dBalance = ab.balance - oldBalance;
        hab.blockNumber = block.height;
        hab.timestamp = new Date(block.timestamp);
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
        await ctx.store.save<HistoricalAccountBalance>(hab);
      })
    );
  }
};

export const resolveMarkets_204361 = async (ctx: Ctx, block: SubstrateBlock) => {
  const event = {
    id: '0000204361-000000-e6cc2',
    name: 'PostHooks.MarketResolved',
  };

  const market = await ctx.store.get(Market, { where: { marketId: 176 } });
  if (!market) return;
  market.resolvedOutcome = '0';
  market.status = MarketStatus.Resolved;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.resolvedOutcome = market.resolvedOutcome;
  hm.event = MarketEvent.MarketResolved;
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);

  for (let i = 0; i < market.outcomeAssets.length; i++) {
    let asset = await ctx.store.get(Asset, {
      where: { assetId: market.outcomeAssets[i]! },
    });
    if (!asset) return;
    const oldPrice = asset.price;
    const oldAssetQty = asset.amountInPool;
    let newPrice = oldPrice;
    let newAssetQty = oldAssetQty;

    if (market.marketType.scalar) {
      const lowerBound = Number(market.marketType.scalar[0]);
      const upperBound = Number(market.marketType.scalar[1]);
      if (asset.assetId.includes('Long')) newPrice = (+market.resolvedOutcome - lowerBound) / (upperBound - lowerBound);
      else if (asset.assetId.includes('Short'))
        newPrice = (upperBound - +market.resolvedOutcome) / (upperBound - lowerBound);
    } else {
      newPrice = i == +market.resolvedOutcome ? 1 : 0;
      newAssetQty = i == +market.resolvedOutcome ? oldAssetQty : BigInt(0);
    }
    asset.price = newPrice;
    asset.amountInPool = newAssetQty;
    console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
    await ctx.store.save<Asset>(asset);

    let ha = new HistoricalAsset();
    ha.id = event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
    ha.assetId = asset.assetId;
    ha.newPrice = newPrice;
    ha.newAmountInPool = newAssetQty;
    ha.dPrice = newPrice - oldPrice;
    ha.dAmountInPool = newAssetQty - oldAssetQty;
    ha.event = event.name.split('.')[1];
    ha.blockNumber = block.height;
    ha.timestamp = new Date(block.timestamp);
    console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
    await ctx.store.save<HistoricalAsset>(ha);

    const abs = await ctx.store.find(AccountBalance, {
      where: { assetId: asset.assetId },
    });
    await Promise.all(
      abs.map(async (ab) => {
        const keyword = ab.id.substring(ab.id.lastIndexOf('-') + 1, ab.id.length);
        let acc = await ctx.store.get(Account, {
          where: { id: Like(`%${keyword}%`) },
        });
        if (!acc || ab.balance === BigInt(0)) return;
        const oldBalance = ab.balance;
        if (market.marketType.categorical) ab.balance = i == +market.resolvedOutcome! ? ab.balance : BigInt(0);
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
        await ctx.store.save<AccountBalance>(ab);

        let hab = new HistoricalAccountBalance();
        hab.id = event.id + '-' + acc.accountId.substring(acc.accountId.length - 5);
        hab.accountId = acc.accountId;
        hab.event = event.name.split('.')[1];
        hab.assetId = ab.assetId;
        hab.dBalance = ab.balance - oldBalance;
        hab.blockNumber = block.height;
        hab.timestamp = new Date(block.timestamp);
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
        await ctx.store.save<HistoricalAccountBalance>(hab);
      })
    );
  }
};

export const resolveMarkets_206797 = async (ctx: Ctx, block: SubstrateBlock) => {
  const event = {
    id: '0000206797-000000-c79df',
    name: 'PostHooks.MarketResolved',
  };

  const market = await ctx.store.get(Market, { where: { marketId: 264 } });
  if (!market) return;
  market.resolvedOutcome = '1';
  market.status = MarketStatus.Resolved;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.resolvedOutcome = market.resolvedOutcome;
  hm.event = MarketEvent.MarketResolved;
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);

  for (let i = 0; i < market.outcomeAssets.length; i++) {
    let asset = await ctx.store.get(Asset, {
      where: { assetId: market.outcomeAssets[i]! },
    });
    if (!asset) return;
    const oldPrice = asset.price;
    const oldAssetQty = asset.amountInPool;
    let newPrice = oldPrice;
    let newAssetQty = oldAssetQty;

    if (market.marketType.scalar) {
      const lowerBound = Number(market.marketType.scalar[0]);
      const upperBound = Number(market.marketType.scalar[1]);
      if (asset.assetId.includes('Long')) newPrice = (+market.resolvedOutcome - lowerBound) / (upperBound - lowerBound);
      else if (asset.assetId.includes('Short'))
        newPrice = (upperBound - +market.resolvedOutcome) / (upperBound - lowerBound);
    } else {
      newPrice = i == +market.resolvedOutcome ? 1 : 0;
      newAssetQty = i == +market.resolvedOutcome ? oldAssetQty : BigInt(0);
    }
    asset.price = newPrice;
    asset.amountInPool = newAssetQty;
    console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
    await ctx.store.save<Asset>(asset);

    let ha = new HistoricalAsset();
    ha.id = event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
    ha.assetId = asset.assetId;
    ha.newPrice = newPrice;
    ha.newAmountInPool = newAssetQty;
    ha.dPrice = newPrice - oldPrice;
    ha.dAmountInPool = newAssetQty - oldAssetQty;
    ha.event = event.name.split('.')[1];
    ha.blockNumber = block.height;
    ha.timestamp = new Date(block.timestamp);
    console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
    await ctx.store.save<HistoricalAsset>(ha);

    const abs = await ctx.store.find(AccountBalance, {
      where: { assetId: asset.assetId },
    });
    await Promise.all(
      abs.map(async (ab) => {
        const keyword = ab.id.substring(ab.id.lastIndexOf('-') + 1, ab.id.length);
        let acc = await ctx.store.get(Account, {
          where: { id: Like(`%${keyword}%`) },
        });
        if (!acc || ab.balance === BigInt(0)) return;
        const oldBalance = ab.balance;
        if (market.marketType.categorical) ab.balance = i == +market.resolvedOutcome! ? ab.balance : BigInt(0);
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
        await ctx.store.save<AccountBalance>(ab);

        let hab = new HistoricalAccountBalance();
        hab.id = event.id + '-' + acc.accountId.substring(acc.accountId.length - 5);
        hab.accountId = acc.accountId;
        hab.event = event.name.split('.')[1];
        hab.assetId = ab.assetId;
        hab.dBalance = ab.balance - oldBalance;
        hab.blockNumber = block.height;
        hab.timestamp = new Date(block.timestamp);
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
        await ctx.store.save<HistoricalAccountBalance>(hab);
      })
    );
  }
};

export const resolveMarkets_211391 = async (ctx: Ctx, block: SubstrateBlock) => {
  const event = {
    id: '0000211391-000000-f8b9f',
    name: 'PostHooks.MarketResolved',
  };

  const market = await ctx.store.get(Market, { where: { marketId: 317 } });
  if (!market) return;
  market.resolvedOutcome = '0';
  market.status = MarketStatus.Resolved;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  let hm = new HistoricalMarket();
  hm.id = event.id + '-' + market.marketId;
  hm.marketId = market.marketId;
  hm.status = market.status;
  hm.resolvedOutcome = market.resolvedOutcome;
  hm.event = MarketEvent.MarketResolved;
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);

  for (let i = 0; i < market.outcomeAssets.length; i++) {
    let asset = await ctx.store.get(Asset, {
      where: { assetId: market.outcomeAssets[i]! },
    });
    if (!asset) return;
    const oldPrice = asset.price;
    const oldAssetQty = asset.amountInPool;
    let newPrice = oldPrice;
    let newAssetQty = oldAssetQty;

    if (market.marketType.scalar) {
      const lowerBound = Number(market.marketType.scalar[0]);
      const upperBound = Number(market.marketType.scalar[1]);
      if (asset.assetId.includes('Long')) newPrice = (+market.resolvedOutcome - lowerBound) / (upperBound - lowerBound);
      else if (asset.assetId.includes('Short'))
        newPrice = (upperBound - +market.resolvedOutcome) / (upperBound - lowerBound);
    } else {
      newPrice = i == +market.resolvedOutcome ? 1 : 0;
      newAssetQty = i == +market.resolvedOutcome ? oldAssetQty : BigInt(0);
    }
    asset.price = newPrice;
    asset.amountInPool = newAssetQty;
    console.log(`[${event.name}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
    await ctx.store.save<Asset>(asset);

    let ha = new HistoricalAsset();
    ha.id = event.id + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
    ha.assetId = asset.assetId;
    ha.newPrice = newPrice;
    ha.newAmountInPool = newAssetQty;
    ha.dPrice = newPrice - oldPrice;
    ha.dAmountInPool = newAssetQty - oldAssetQty;
    ha.event = event.name.split('.')[1];
    ha.blockNumber = block.height;
    ha.timestamp = new Date(block.timestamp);
    console.log(`[${event.name}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
    await ctx.store.save<HistoricalAsset>(ha);

    const abs = await ctx.store.find(AccountBalance, {
      where: { assetId: asset.assetId },
    });
    await Promise.all(
      abs.map(async (ab) => {
        const keyword = ab.id.substring(ab.id.lastIndexOf('-') + 1, ab.id.length);
        let acc = await ctx.store.get(Account, {
          where: { id: Like(`%${keyword}%`) },
        });
        if (!acc || ab.balance === BigInt(0)) return;
        const oldBalance = ab.balance;
        if (market.marketType.categorical) ab.balance = i == +market.resolvedOutcome! ? ab.balance : BigInt(0);
        console.log(`[${event.name}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
        await ctx.store.save<AccountBalance>(ab);

        let hab = new HistoricalAccountBalance();
        hab.id = event.id + '-' + acc.accountId.substring(acc.accountId.length - 5);
        hab.accountId = acc.accountId;
        hab.event = event.name.split('.')[1];
        hab.assetId = ab.assetId;
        hab.dBalance = ab.balance - oldBalance;
        hab.blockNumber = block.height;
        hab.timestamp = new Date(block.timestamp);
        console.log(`[${event.name}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
        await ctx.store.save<HistoricalAccountBalance>(hab);
      })
    );
  }
};
