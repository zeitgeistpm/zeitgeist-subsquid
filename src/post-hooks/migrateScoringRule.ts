import { Store } from '@subsquid/typeorm-store';
import { Market, ScoringRule } from '../model';

export const migrateScoringRule = async (store: Store) => {
  const eventName = 'PostHooks.MigrateScoringRule';

  const markets = await store.find(Market, { where: { scoringRule: ScoringRule.CPMM } });
  for (let i = 0; i < markets.length; i++) {
    const market = markets[i];
    market.scoringRule = ScoringRule.Lmsr;
    console.log(`[${eventName}] Saving market: ${JSON.stringify(market, null, 2)}`);
    await store.save<Market>(market);
  }
};
