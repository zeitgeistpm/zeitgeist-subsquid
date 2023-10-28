import { SubstrateBlock } from '@subsquid/substrate-processor';
import { Ctx, EventItem } from '../../processor';
import { HistoricalMarket, Market, MarketReport, MarketStatus, OutcomeReport } from '../../model';
import { formatMarketEvent } from '../helper';
import { getAuthorityReportedEvent } from './types';

export const authorityReport = async (ctx: Ctx, block: SubstrateBlock, item: EventItem) => {
  const { marketId, outcome } = getAuthorityReportedEvent(ctx, item);

  const market = await ctx.store.get(Market, { where: { marketId: Number(marketId) } });
  if (!market) return;

  const ocr = new OutcomeReport({
    categorical: outcome.__kind == 'Categorical' ? outcome.value : null,
    scalar: outcome.__kind == 'Scalar' ? outcome.value : null,
  });

  const mr = new MarketReport({
    at: block.height,
    by: market.authorizedAddress,
    outcome: ocr,
  });

  market.status = MarketStatus.Reported;
  market.report = mr;
  console.log(`[${item.event.name}] Saving market: ${JSON.stringify(market, null, 2)}`);
  await ctx.store.save<Market>(market);

  const hm = new HistoricalMarket({
    blockNumber: block.height,
    by: mr.by,
    event: formatMarketEvent(item.event.name),
    id: item.event.id + '-' + market.marketId,
    market: market,
    outcome: ocr,
    poolId: null,
    resolvedOutcome: market.resolvedOutcome,
    status: market.status,
    timestamp: new Date(block.timestamp),
  });
  console.log(`[${item.event.name}] Saving historical market: ${JSON.stringify(hm, null, 2)}`);
  await ctx.store.save<HistoricalMarket>(hm);
};
