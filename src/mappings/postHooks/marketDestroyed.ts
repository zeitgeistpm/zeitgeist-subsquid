import { BlockHandlerContext } from '@subsquid/substrate-processor';
import { Store } from '@subsquid/typeorm-store';
import { HistoricalMarket, Market, MarketStatus } from '../../model';

export async function destroyMarkets(ctx: BlockHandlerContext<Store>) {
  const mIds = [
    8, 9, 10, 11, 12, 16, 17, 19, 20, 26, 27, 28, 37, 38, 39, 42, 43, 45, 50, 51, 52, 53, 57, 
    58, 66, 67, 92, 105, 112, 124, 126, 134, 135, 137, 151, 152, 158, 159, 161, 162, 165, 182, 
    191, 202, 232, 239, 252, 253, 257, 258, 265, 266, 283, 284, 312, 328, 333, 334, 335, 344,
  ];

  await Promise.all(
    mIds.map(async (mId) => {
      let market = await ctx.store.get(Market, { where: { marketId: mId } });
      if (!market) return;
  
      market.status = MarketStatus.Destroyed;
      console.log(`[postHooks.destroyMarkets] Saving market: ${JSON.stringify(market, null, 2)}`);
      await ctx.store.save<Market>(market);
  
      let hm = new HistoricalMarket();
      hm.id = '0000579140-000000-9634e-' + market.marketId;
      hm.marketId = market.marketId;
      hm.event = 'MarketDestroyed';
      hm.status = market.status;
      hm.blockNumber = ctx.block.height;
      hm.timestamp = new Date(ctx.block.timestamp);
      console.log(`[postHooks.destroyMarkets] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
      await ctx.store.save<HistoricalMarket>(hm);
    })
  )
}
