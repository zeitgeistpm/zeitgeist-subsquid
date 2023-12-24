import { Store } from '@subsquid/typeorm-store';
import { HistoricalMarket, Market, MarketEvent, MarketReport, MarketStatus, OutcomeReport } from '../../model';
import { Block, Event } from '../../processor';
import { decodeAuthorityReportedEvent } from './decode';

export const authorityReported = async (store: Store, block: Block, event: Event) => {
  const { marketId, outcome } = decodeAuthorityReportedEvent(event);

  const market = await store.get(Market, { where: { marketId: Number(marketId) } });
  if (!market) return;

  const ocr = new OutcomeReport({
    categorical: outcome.__kind == 'Categorical' ? outcome.value : null,
    scalar: outcome.__kind == 'Scalar' ? outcome.value : null,
  });
  const mr = new MarketReport({
    at: block.height,
    by: null,
    outcome: ocr,
  });
  market.status = MarketStatus.Reported;
  market.report = mr;
  console.log(`[${event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: block.height,
    by: null,
    event: MarketEvent.MarketReported,
    id: event.id + '-' + market.marketId,
    market: market,
    outcome: ocr,
    resolvedOutcome: null,
    status: market.status,
    timestamp: new Date(block.timestamp!),
  });
  console.log(`[${event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await store.save<HistoricalMarket>(hm);
};
