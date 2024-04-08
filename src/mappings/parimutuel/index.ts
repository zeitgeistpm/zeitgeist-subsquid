import { Store } from '@subsquid/typeorm-store';
import { HistoricalMarket, HistoricalSwap, Market, MarketEvent } from '../../model';
import { SwapEvent } from '../../consts';
import { extrinsicFromEvent } from '../../helper';
import { Event } from '../../processor';
import * as decode from './decode';

export const outcomeBought = async (
  store: Store,
  event: Event
): Promise<{ historicalSwap: HistoricalSwap; historicalMarket: HistoricalMarket } | undefined> => {
  const { marketId, buyer, asset, amountMinusFees, fees } = decode.outcomeBought(event);

  const market = await store.get(Market, {
    where: { marketId },
  });
  if (!market) return;

  market.volume += amountMinusFees;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const historicalMarket = new HistoricalMarket({
    blockNumber: event.block.height,
    by: buyer,
    dLiquidity: BigInt(0),
    dVolume: amountMinusFees,
    event: MarketEvent.OutcomeBought,
    id: event.id + '-' + market.marketId,
    liquidity: market.liquidity,
    market,
    outcome: null,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });

  const historicalSwap = new HistoricalSwap({
    accountId: buyer,
    assetAmountIn: amountMinusFees,
    assetAmountOut: amountMinusFees,
    assetIn: market.baseAsset,
    assetOut: asset,
    blockNumber: event.block.height,
    event: SwapEvent.OutcomeBought,
    externalFeeAmount: fees,
    extrinsic: extrinsicFromEvent(event),
    id: event.id,
    swapFeeAmount: BigInt(0),
    timestamp: new Date(event.block.timestamp!),
  });

  return { historicalSwap, historicalMarket };
};
