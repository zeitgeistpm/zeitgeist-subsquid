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

export const resolveMarket = async (ctx: Ctx, block: SubstrateBlock, marketId: number, resolvedOutcome: string) => {
  const eventName = 'PostHooks.MarketResolved';
  const eventId = block.id.slice(0, 11) + '000000' + block.id.slice(-6);

  const market = await ctx.store.get(Market, { where: { marketId: marketId } });
  if (!market) return;
  market.resolvedOutcome = resolvedOutcome;
  market.status = MarketStatus.Resolved;
  console.log(`[${eventName}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket();
  hm.id = eventId + '-' + market.marketId;
  hm.market = market;
  hm.status = market.status;
  hm.resolvedOutcome = market.resolvedOutcome;
  hm.event = MarketEvent.MarketResolved;
  hm.blockNumber = block.height;
  hm.timestamp = new Date(block.timestamp);
  console.log(`[${eventName}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);

  await Promise.all(
    market.outcomeAssets.map(async (outcomeAsset, i) => {
      if (market.marketType.categorical && i !== +market.resolvedOutcome!) {
        let abs = await ctx.store.find(AccountBalance, {
          where: { assetId: outcomeAsset! },
        });
        abs.map(async (ab) => {
          const accLookupKey = ab.id.substring(0, ab.id.indexOf('-'));
          let acc = await ctx.store.get(Account, {
            where: { id: Like(`%${accLookupKey}%`) },
          });
          if (!acc || ab.balance === BigInt(0)) return;
          const oldBalance = ab.balance;
          const newBalance = BigInt(0);
          ab.balance = newBalance;
          console.log(`[${eventName}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
          await ctx.store.save<AccountBalance>(ab);

          const hab = new HistoricalAccountBalance();
          hab.id = eventId + '-' + market.marketId + i + '-' + acc.accountId.slice(- 5);
          hab.accountId = acc.accountId;
          hab.event = eventName.split('.')[1];
          hab.assetId = ab.assetId;
          hab.dBalance = newBalance - oldBalance;
          hab.blockNumber = block.height;
          hab.timestamp = new Date(block.timestamp);
          console.log(`[${eventName}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
          await ctx.store.save<HistoricalAccountBalance>(hab);
        });
      }

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
        if (asset.assetId.includes('Long')) {
          newPrice = (+market.resolvedOutcome! - lowerBound) / (upperBound - lowerBound);
        } else if (asset.assetId.includes('Short')) {
          newPrice = (upperBound - +market.resolvedOutcome!) / (upperBound - lowerBound);
        }
      } else {
        newPrice = i == +market.resolvedOutcome! ? 1 : 0;
        newAssetQty = i == +market.resolvedOutcome! ? oldAssetQty : BigInt(0);
      }
      asset.price = newPrice;
      asset.amountInPool = newAssetQty;
      console.log(`[${eventName}] Saving asset: ${JSON.stringify(asset, null, 2)}`);
      await ctx.store.save<Asset>(asset);

      const ha = new HistoricalAsset();
      ha.id = eventId + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1);
      ha.assetId = asset.assetId;
      ha.newPrice = newPrice;
      ha.newAmountInPool = newAssetQty;
      ha.dPrice = newPrice - oldPrice;
      ha.dAmountInPool = newAssetQty - oldAssetQty;
      ha.event = eventName.split('.')[1];
      ha.blockNumber = block.height;
      ha.timestamp = new Date(block.timestamp);
      console.log(`[${eventName}] Saving historical asset: ${JSON.stringify(ha, null, 2)}`);
      await ctx.store.save<HistoricalAsset>(ha);
    })
  );
};