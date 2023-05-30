import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Like } from 'typeorm';
import {
  Account,
  AccountBalance,
  HistoricalAccountBalance,
  HistoricalMarket,
  Market,
  MarketEvent,
  MarketStatus,
} from '../../model';
import { Ctx } from '../../processor';

export const destroyMarkets = async (ctx: Ctx, block: SubstrateBlock) => {
  const eventId = block.id.slice(0, 11) + '000000' + block.id.slice(-6);
  const eventName = 'PostHooks.MarketDestroyed';
  const marketIds = [
    8, 9, 10, 11, 12, 16, 17, 19, 20, 26, 27, 28, 37, 38, 39, 42, 43, 45, 50, 51, 52, 53, 57, 58, 66, 67, 92, 105, 112,
    124, 126, 134, 135, 137, 151, 152, 158, 159, 161, 162, 165, 182, 191, 202, 232, 239, 252, 253, 257, 258, 265, 266,
    283, 284, 312, 328, 333, 334, 335, 344,
  ];

  await Promise.all(
    marketIds.map(async (mId) => {
      const market = await ctx.store.get(Market, { where: { marketId: mId } });
      if (!market) return;
      market.status = MarketStatus.Destroyed;
      console.log(`[${eventName}] Saving market: ${JSON.stringify(market, null, 2)}`);
      await ctx.store.save<Market>(market);

      const hm = new HistoricalMarket();
      hm.id = eventId + '-' + market.marketId;
      hm.marketId = market.marketId;
      hm.event = MarketEvent.MarketDestroyed;
      hm.status = market.status;
      hm.blockNumber = block.height;
      hm.timestamp = new Date(block.timestamp);
      console.log(`[${eventName}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
      await ctx.store.save<HistoricalMarket>(hm);

      for (let i = 0; i < market.outcomeAssets.length; i++) {
        const abs = await ctx.store.find(AccountBalance, {
          where: { assetId: market.outcomeAssets[i]! },
        });
        await Promise.all(
          abs.map(async (ab) => {
            const keyword = ab.id.substring(ab.id.lastIndexOf('-') + 1, ab.id.length);
            const acc = await ctx.store.get(Account, {
              where: { id: Like(`%${keyword}%`) },
            });
            if (!acc || ab.balance === BigInt(0)) return;
            const oldBalance = ab.balance;
            ab.balance = BigInt(0);
            console.log(`[${eventName}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
            await ctx.store.save<AccountBalance>(ab);

            const hab = new HistoricalAccountBalance();
            hab.id = eventId + '-' + acc.accountId.substring(acc.accountId.length - 5);
            hab.accountId = acc.accountId;
            hab.event = eventName.split('.')[1];
            hab.assetId = ab.assetId;
            hab.dBalance = ab.balance - oldBalance;
            hab.blockNumber = block.height;
            hab.timestamp = new Date(block.timestamp);
            console.log(`[${eventName}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
            await ctx.store.save<HistoricalAccountBalance>(hab);
          })
        );
      }
    })
  );
};
