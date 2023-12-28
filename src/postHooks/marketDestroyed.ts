import { Store } from '@subsquid/typeorm-store';
import { Like } from 'typeorm';
import {
  Account,
  AccountBalance,
  HistoricalAccountBalance,
  HistoricalMarket,
  Market,
  MarketEvent,
  MarketStatus,
} from '../model';

export const destroyMarkets = async (store: Store) => {
  const blockNumber = 579140;
  const eventId = '0000579140-000000-9634e';
  const eventName = 'PostHooks.MarketDestroyed';
  const timestamp = new Date('2022-02-07T14:44:48.135000Z');
  const marketIds = [
    8, 9, 10, 11, 12, 16, 17, 19, 20, 26, 27, 28, 37, 38, 42, 45, 50, 51, 52, 53, 57, 66, 67, 92, 112, 124, 126, 134,
    135, 137, 151, 152, 158, 161, 162, 165, 182, 191, 202, 232, 239, 252, 253, 257, 258, 265, 266, 283, 284, 312, 328,
    333, 334, 335, 344,
  ];

  await Promise.all(
    marketIds.map(async (marketId) => {
      const market = await store.get(Market, { where: { marketId } });
      if (!market) return;
      market.status = MarketStatus.Destroyed;
      console.log(`[${eventName}] Saving market: ${JSON.stringify(market, null, 2)}`);
      await store.save<Market>(market);

      const hm = new HistoricalMarket({
        blockNumber,
        by: null,
        event: MarketEvent.MarketDestroyed,
        id: eventId + '-' + marketId,
        market,
        outcome: null,
        resolvedOutcome: null,
        status: market.status,
        timestamp,
      });
      console.log(`[${eventName}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
      await store.save<HistoricalMarket>(hm);

      for (let i = 0; i < market.outcomeAssets.length; i++) {
        const abs = await store.find(AccountBalance, {
          where: { assetId: market.outcomeAssets[i]! },
        });
        await Promise.all(
          abs.map(async (ab) => {
            const accLookupKey = ab.id.substring(0, ab.id.indexOf('-'));
            const acc = await store.get(Account, {
              where: { id: Like(`%${accLookupKey}%`) },
            });
            if (!acc || ab.balance === BigInt(0)) return;
            const oldBalance = ab.balance;
            ab.balance = BigInt(0);
            console.log(`[${eventName}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
            await store.save<AccountBalance>(ab);

            const hab = new HistoricalAccountBalance({
              accountId: acc.accountId,
              assetId: ab.assetId,
              blockNumber,
              dBalance: ab.balance - oldBalance,
              event: eventName.split('.')[1],
              id: eventId + '-' + market.marketId + i + '-' + acc.accountId.slice(-5),
              timestamp,
            });
            console.log(`[${eventName}] Saving historical account balance: ${JSON.stringify(hab, null, 2)}`);
            await store.save<HistoricalAccountBalance>(hab);
          })
        );
      }
    })
  );
};
