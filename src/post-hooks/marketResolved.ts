import { Store } from '@subsquid/typeorm-store';
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
} from '../model';
import { ResolvedMarket } from '.';

export const resolveMarkets = async (store: Store, blockHeight: number): Promise<HistoricalAsset[]> => {
  const eventName = 'PostHooks.MarketResolved';
  const historicalAssets: HistoricalAsset[] = [];

  await Promise.all(
    resolvedMarkets
      .filter((rm) => {
        return rm.blockHeight === blockHeight;
      })
      .map(async (rm) => {
        const market = await store.get(Market, { where: { marketId: rm.marketId } });
        if (!market) return;

        market.resolvedOutcome = rm.resolvedOutcome;
        const oldLiquidity = market.liquidity;
        let newLiquidity = BigInt(0);
        
        await Promise.all(
          market.outcomeAssets.map(async (outcomeAsset, i) => {
            if (market.marketType.categorical && i !== +market.resolvedOutcome!) {
              let abs = await store.find(AccountBalance, {
                where: { assetId: outcomeAsset! },
              });
              abs.map(async (ab) => {
                const accLookupKey = ab.id.substring(0, ab.id.indexOf('-'));
                let acc = await store.get(Account, {
                  where: { id: Like(`%${accLookupKey}%`) },
                });
                if (!acc || ab.balance === BigInt(0)) return;
                const oldBalance = ab.balance;
                const newBalance = BigInt(0);
                ab.balance = newBalance;
                console.log(`[${eventName}] Saving account balance: ${JSON.stringify(ab, null, 2)}`);
                await store.save<AccountBalance>(ab);

                const hab = new HistoricalAccountBalance({
                  accountId: acc.accountId,
                  assetId: ab.assetId,
                  blockNumber: rm.blockHeight,
                  dBalance: newBalance - oldBalance,
                  event: eventName.split('.')[1],
                  id: rm.eventId + '-' + market.marketId + i + '-' + acc.accountId.slice(-5),
                  timestamp: new Date(rm.blockTimestamp),
                });
                console.log(`[${eventName}] Saving historical account balance: ${JSON.stringify(ab, null, 2)}`);
                await store.save<HistoricalAccountBalance>(hab);
              });
            }

            let asset = await store.get(Asset, {
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
            await store.save<Asset>(asset);

            newLiquidity += BigInt(Math.round(asset.price * +asset.amountInPool.toString()));

            const ha = new HistoricalAsset({
              accountId: null,
              assetId: asset.assetId,
              blockNumber: rm.blockHeight,
              dAmountInPool: newAssetQty - oldAssetQty,
              dPrice: newPrice - oldPrice,
              event: eventName.split('.')[1],
              id: rm.eventId + '-' + asset.id.substring(asset.id.lastIndexOf('-') + 1),
              newAmountInPool: newAssetQty,
              newPrice: newPrice,
              timestamp: new Date(rm.blockTimestamp),
            });
            historicalAssets.push(ha);
          })
        );

        market.liquidity = newLiquidity;
        market.status = MarketStatus.Resolved;
        console.log(`[${eventName}] Saving market: ${JSON.stringify(market, null, 2)}`);
        await store.save<Market>(market);

        const hm = new HistoricalMarket({
          blockNumber: rm.blockHeight,
          by: null,
          dLiquidity: newLiquidity - oldLiquidity,
          dVolume: BigInt(0),
          event: MarketEvent.MarketResolved,
          id: rm.eventId + '-' + rm.marketId,
          liquidity: newLiquidity,
          market,
          outcome: null,
          resolvedOutcome: market.resolvedOutcome,
          status: market.status,
          timestamp: new Date(rm.blockTimestamp),
          volume: market.volume,
        });
        console.log(`[${eventName}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
        await store.save<HistoricalMarket>(hm);
      })
  );
  return historicalAssets;
};

const resolvedMarkets: ResolvedMarket[] = [
  {
    blockHeight: 35683,
    blockTimestamp: '2021-10-13T18:54:24.050000Z',
    eventId: '0000035683-000000-1600e',
    marketId: 21,
    resolvedOutcome: '0',
  },
  {
    blockHeight: 49326,
    blockTimestamp: '2021-10-15T16:35:12.104000Z',
    marketId: 60,
    eventId: '0000049326-000000-1fb18',
    resolvedOutcome: '1',
  },
  {
    blockHeight: 72589,
    blockTimestamp: '2021-10-18T22:36:30.081000Z',
    eventId: '0000072589-000000-55dfd',
    marketId: 1,
    resolvedOutcome: '0',
  },
  {
    blockHeight: 72601,
    blockTimestamp: '2021-10-18T22:38:54.081000Z',
    eventId: '0000072601-000000-9be06',
    marketId: 2,
    resolvedOutcome: '2',
  },
  {
    blockHeight: 72609,
    blockTimestamp: '2021-10-18T22:40:30.115000Z',
    eventId: '0000072609-000000-1fc2b',
    marketId: 3,
    resolvedOutcome: '2',
  },
  {
    blockHeight: 78711,
    blockTimestamp: '2021-10-19T19:05:12.065000Z',
    eventId: '0000078711-000000-637a0',
    marketId: 4,
    resolvedOutcome: '1',
  },
  {
    blockHeight: 82291,
    blockTimestamp: '2021-10-20T07:04:24.076000Z',
    eventId: '0000082291-000000-90fba',
    marketId: 69,
    resolvedOutcome: '2',
  },
  {
    blockHeight: 92128,
    blockTimestamp: '2021-10-21T16:00:30.057000Z',
    eventId: '0000092128-000000-1e9d6',
    marketId: 71,
    resolvedOutcome: '2',
  },
  {
    blockHeight: 93884,
    blockTimestamp: '2021-10-21T21:52:54.071000Z',
    eventId: '0000093884-000000-892a5',
    marketId: 23,
    resolvedOutcome: '0',
  },
  {
    blockHeight: 107221,
    blockTimestamp: '2021-10-23T18:34:48.107000Z',
    eventId: '0000107221-000000-bf726',
    marketId: 96,
    resolvedOutcome: '0',
  },
  {
    blockHeight: 108949,
    blockTimestamp: '2021-10-24T00:26:18.120000Z',
    eventId: '0000108949-000000-3263e',
    marketId: 79,
    resolvedOutcome: '1',
  },
  {
    blockHeight: 114289,
    blockTimestamp: '2021-10-24T18:25:30.102000Z',
    eventId: '0000114289-000000-668e7',
    marketId: 97,
    resolvedOutcome: '1',
  },
  {
    blockHeight: 122186,
    blockTimestamp: '2021-10-25T20:59:06.113000Z',
    eventId: '0000122186-000000-c9487',
    marketId: 5,
    resolvedOutcome: '1',
  },
  {
    blockHeight: 122516,
    blockTimestamp: '2021-10-25T22:05:30.103000Z',
    eventId: '0000122516-000000-bfa2a',
    marketId: 98,
    resolvedOutcome: '0',
  },
  {
    blockHeight: 128525,
    blockTimestamp: '2021-10-26T18:11:54.089000Z',
    eventId: '0000128525-000000-5074f',
    marketId: 99,
    resolvedOutcome: '0',
  },
  {
    blockHeight: 133189,
    blockTimestamp: '2021-10-27T09:54:18.183000Z',
    eventId: '0000133189-000000-11b83',
    marketId: 150,
    resolvedOutcome: '1',
  },
  {
    blockHeight: 133996,
    blockTimestamp: '2021-10-27T12:36:18.172000Z',
    eventId: '0000133996-000000-dbc90',
    marketId: 6,
    resolvedOutcome: '1',
  },
  {
    blockHeight: 134565,
    blockTimestamp: '2021-10-27T14:30:06.198000Z',
    eventId: '0000134565-000000-bb859',
    marketId: 149,
    resolvedOutcome: '1',
  },
  {
    blockHeight: 155917,
    blockTimestamp: '2021-10-31T13:35:36.691000Z',
    eventId: '0000155917-000000-3f61f',
    marketId: 129,
    resolvedOutcome: '0',
  },
  {
    blockHeight: 164057,
    blockTimestamp: '2021-11-01T16:55:48.119000Z',
    eventId: '0000164057-000000-6c01e',
    marketId: 169,
    resolvedOutcome: '1',
  },
  {
    blockHeight: 167323,
    blockTimestamp: '2021-11-02T05:15:42.218000Z',
    eventId: '0000167323-000000-04acf',
    marketId: 224,
    resolvedOutcome: '2',
  },
  {
    blockHeight: 168378,
    blockTimestamp: '2021-11-02T08:49:18.097000Z',
    eventId: '0000168378-000000-e544d',
    marketId: 167,
    resolvedOutcome: '0',
  },
  {
    blockHeight: 168726,
    blockTimestamp: '2021-11-02T09:59:18.129000Z',
    eventId: '0000168726-000000-4c325',
    marketId: 7,
    resolvedOutcome: '0',
  },
  {
    blockHeight: 175178,
    blockTimestamp: '2021-11-03T07:40:18.096000Z',
    eventId: '0000175178-000000-df5fd',
    marketId: 155,
    resolvedOutcome: '0',
  },
  {
    blockHeight: 176396,
    blockTimestamp: '2021-11-03T11:45:12.118000Z',
    eventId: '0000176396-000000-690d7',
    marketId: 224,
    resolvedOutcome: '0',
  },
  {
    blockHeight: 176408,
    blockTimestamp: '2021-11-03T11:47:42.116000Z',
    eventId: '0000176408-000000-6059b',
    marketId: 56,
    resolvedOutcome: '2',
  },
  {
    blockHeight: 178290,
    blockTimestamp: '2021-11-03T18:06:00.103000Z',
    eventId: '0000178290-000000-58224',
    marketId: 222,
    resolvedOutcome: '1',
  },
  {
    blockHeight: 179524,
    blockTimestamp: '2021-11-03T22:14:12.127000Z',
    eventId: '0000179524-000000-79a82',
    marketId: 22,
    resolvedOutcome: '1',
  },
  {
    blockHeight: 182096,
    blockTimestamp: '2021-11-04T06:50:42.113000Z',
    eventId: '0000182096-000000-38a0a',
    marketId: 14,
    resolvedOutcome: '1',
  },
  {
    blockHeight: 184820,
    blockTimestamp: '2021-11-04T15:57:18.097000Z',
    eventId: '0000184820-000000-d843f',
    marketId: 15,
    resolvedOutcome: '1',
  },
  {
    blockHeight: 204361,
    blockTimestamp: '2021-12-10T16:26:42.078000Z',
    eventId: '0000204361-000000-e6cc2',
    marketId: 176,
    resolvedOutcome: '0',
  },
  {
    blockHeight: 206797,
    blockTimestamp: '2021-12-15T16:45:42.032000Z',
    eventId: '0000206797-000000-c79df',
    marketId: 264,
    resolvedOutcome: '1',
  },
  {
    blockHeight: 211391,
    blockTimestamp: '2021-12-16T10:05:18.032000Z',
    eventId: '0000211391-000000-f8b9f',
    marketId: 317,
    resolvedOutcome: '1',
  },
];
