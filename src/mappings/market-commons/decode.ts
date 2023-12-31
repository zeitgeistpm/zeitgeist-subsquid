import { Market, MarketBonds } from '../../types/v51';
import { storage } from '../../types';
import { Block } from '../../processor';

export const decodeMarketsStorage = async (block: Block, marketId: bigint): Promise<MarketBonds | undefined> => {
  let market: Market | undefined;
  if (storage.marketCommons.markets.v46.is(block)) {
    market = await storage.marketCommons.markets.v46.get(block, marketId);
  } else if (storage.marketCommons.markets.v49.is(block)) {
    market = await storage.marketCommons.markets.v49.get(block, marketId);
  } else if (storage.marketCommons.markets.v50.is(block)) {
    market = await storage.marketCommons.markets.v50.get(block, marketId);
  } else if (storage.marketCommons.markets.v51.is(block)) {
    market = await storage.marketCommons.markets.v51.get(block, marketId);
  }
  if (!market) return;
  return market.bonds;
};
