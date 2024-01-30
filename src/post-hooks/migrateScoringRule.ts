import { Store } from '@subsquid/typeorm-store';
import { Market, ScoringRule } from '../model';

export const migrateScoringRule = async (store: Store) => {
  const eventName = 'PostHooks.MigrateScoringRule';
  const updatedMarkets: Market[] = [];

  const markets = await store.findBy(Market, { scoringRule: ScoringRule.CPMM });
  await Promise.all(
    markets.map(async (market) => {
      market.scoringRule = ScoringRule.Lmsr;
      updatedMarkets.push(market);
    })
  );
  console.log(`[${eventName}] Saving markets: ${JSON.stringify(updatedMarkets, null, 2)}`);
  await store.save<Market>(updatedMarkets);
};
