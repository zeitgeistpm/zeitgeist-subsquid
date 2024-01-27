import { Store } from '@subsquid/typeorm-store';
import { HistoricalMarket, Market, MarketEvent, MarketReport, MarketStatus, OutcomeReport } from '../../model';
import { Event } from '../../processor';
import { decodeAuthorityReportedEvent } from './decode';

export const authorityReported = async (store: Store, event: Event) => {
  const { marketId, outcome } = decodeAuthorityReportedEvent(event);

  const market = await store.get(Market, { where: { marketId: Number(marketId) } });
  if (!market) return;

  const ocr = new OutcomeReport({
    categorical: outcome.__kind == 'Categorical' ? outcome.value : null,
    scalar: outcome.__kind == 'Scalar' ? outcome.value : null,
  });
  const mr = new MarketReport({
    at: event.block.height,
    by: null,
    outcome: ocr,
  });
  market.status = MarketStatus.Reported;
  market.report = mr;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: event.block.height,
    dLiquidity: BigInt(0),
    by: null,
    dVolume: BigInt(0),
    event: MarketEvent.MarketReported,
    id: event.id + '-' + market.marketId,
    liquidity: market.liquidity,
    market: market,
    outcome: ocr,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(event.block.timestamp!),
    volume: market.volume,
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};
