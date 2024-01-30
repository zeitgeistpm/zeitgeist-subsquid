import { Store } from '@subsquid/typeorm-store';
import { Market, ScoringRule } from '../model';

export const migrateScoringRule = async (store: Store) => {
  const eventName = 'PostHooks.MigrateScoringRule';

  const marketIds = [0, 9, 534];

  await Promise.all(
    marketIds.map(async (marketId) => {
      const market = await store.get(Market, { where: { marketId } });
      if (!market) return;
      market.scoringRule = ScoringRule.Lmsr;
      console.log(`[${eventName}] Saving market: ${JSON.stringify(market, null, 2)}`);
      await store.save<Market>(market);
    })
  );
};
