import { Store } from '@subsquid/typeorm-store';
import { Market, MarketStatus, ScoringRule } from '../model';

export const migrateToAmmCdaHybrid = async (store: Store) => {
  const eventName = 'PostHooks.MigrateScoringRule';
  const updatedMarkets: Market[] = [];

  const markets = await store.findBy(Market, { scoringRule: ScoringRule.Lmsr });
  await Promise.all(
    markets.map(async (market) => {
      market.scoringRule = ScoringRule.AmmCdaHybrid;
      updatedMarkets.push(market);
    })
  );
  console.log(`[${eventName}] Saving markets: ${JSON.stringify(updatedMarkets, null, 2)}`);
  await store.save<Market>(updatedMarkets);
};

export const migrateToLmsr = async (store: Store) => {
  const eventName = 'PostHooks.MigrateScoringRule';
  const updatedMarkets: Market[] = [];

  const markets = await store.findBy(Market, { status: MarketStatus.Active, scoringRule: ScoringRule.CPMM });
  await Promise.all(
    markets.map(async (market) => {
      market.scoringRule = ScoringRule.Lmsr;
      updatedMarkets.push(market);
    })
  );
  console.log(`[${eventName}] Saving markets: ${JSON.stringify(updatedMarkets, null, 2)}`);
  await store.save<Market>(updatedMarkets);
};
