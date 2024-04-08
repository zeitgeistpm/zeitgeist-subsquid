import { Market as Market_v51 } from '../../types/v51';
import { Market as Market_v54, MarketBonds } from '../../types/v54';
import { storage } from '../../types';
import { Block } from '../../processor';

export const decodeMarketsStorage = async (block: Block, marketId: bigint): Promise<MarketBonds | undefined> => {
  let market: Market_v51 | Market_v54 | undefined;
  if (storage.marketCommons.markets.v46.is(block)) {
    market = await storage.marketCommons.markets.v46.get(block, marketId);
  } else if (storage.marketCommons.markets.v49.is(block)) {
    market = await storage.marketCommons.markets.v49.get(block, marketId);
  } else if (storage.marketCommons.markets.v50.is(block)) {
    market = await storage.marketCommons.markets.v50.get(block, marketId);
  } else if (storage.marketCommons.markets.v51.is(block)) {
    market = await storage.marketCommons.markets.v51.get(block, marketId);
  } else if (storage.marketCommons.markets.v53.is(block)) {
    market = await storage.marketCommons.markets.v53.get(block, marketId);
  } else if (storage.marketCommons.markets.v54.is(block)) {
    market = await storage.marketCommons.markets.v54.get(block, marketId);
  }
  return market?.bonds;
};
