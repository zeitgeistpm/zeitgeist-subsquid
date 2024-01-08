import * as ss58 from '@subsquid/ss58';
import { OutcomeReport } from '../../types/v29';
import { MarketStatus } from '../../types/v42';
import { calls, events } from '../../types';
import { formatAssetId } from '../../helper';
import { Call, Event } from '../../processor';

export const decodeBoughtCompleteSetEvent = (event: Event): CompleteSetEvent => {
  let marketId: bigint, amount: bigint, accountId: string;
  if (events.predictionMarkets.boughtCompleteSet.v23.is(event)) {
    [marketId, accountId] = events.predictionMarkets.boughtCompleteSet.v23.decode(event);
    amount = BigInt(0);
  } else if (events.predictionMarkets.boughtCompleteSet.v34.is(event)) {
    [marketId, amount, accountId] = events.predictionMarkets.boughtCompleteSet.v34.decode(event);
  } else {
    [marketId, amount, accountId] = event.args;
  }
  return {
    marketId: Number(marketId),
    amount: BigInt(amount),
    accountId: ss58.encode({ prefix: 73, bytes: accountId }),
  };
};

export const decodeGlobalDisputeStartedEvent = (event: Event): MarketEvent => {
  let marketId: bigint;
  if (events.predictionMarkets.globalDisputeStarted.v41.is(event)) {
    marketId = events.predictionMarkets.globalDisputeStarted.v41.decode(event);
  } else {
    [marketId] = event.args;
  }
  return {
    marketId: Number(marketId),
  };
};

export const decodeMarketApprovedEvent = (event: Event): MarketEvent => {
  let marketId: bigint;
  if (events.predictionMarkets.marketApproved.v23.is(event)) {
    marketId = events.predictionMarkets.marketApproved.v23.decode(event);
  } else if (events.predictionMarkets.marketApproved.v29.is(event)) {
    [marketId] = events.predictionMarkets.marketApproved.v29.decode(event);
  } else {
    [marketId] = event.args;
  }
  return {
    marketId: Number(marketId),
  };
};

export const decodeMarketClosedEvent = (event: Event): MarketEvent => {
  let marketId: bigint;
  if (events.predictionMarkets.marketClosed.v37.is(event)) {
    marketId = events.predictionMarkets.marketClosed.v37.decode(event);
  } else {
    [marketId] = event.args;
  }
  return {
    marketId: Number(marketId),
  };
};

export const decodeMarketCreatedEvent = (event: Event, specVersion: number): MarketCreatedEvent => {
  let accountId: string | undefined, market: any;
  const [param0, param1, param2] = event.args;
  if (
    events.predictionMarkets.marketCreated.v23.is(event) ||
    events.predictionMarkets.marketCreated.v29.is(event) ||
    specVersion === 23 ||
    specVersion === 29
  ) {
    market = param1;
    market.disputeMechanism = market.mdm;
    market.period.start = market.period.value[0];
    market.period.end = market.period.value[1];
  } else if (events.predictionMarkets.marketCreated.v32.is(event)) {
    market = param1;
    market.disputeMechanism = market.mdm;
    market.period.start = market.period.value.start;
    market.period.end = market.period.value.end;
  } else if (events.predictionMarkets.marketCreated.v36.is(event)) {
    accountId = param1;
    market = param2;
    market.disputeMechanism = market.mdm;
    market.period.start = market.period.value.start;
    market.period.end = market.period.value.end;
  } else {
    accountId = param1;
    market = param2;
    market.period.start = market.period.value.start;
    market.period.end = market.period.value.end;
  }
  return {
    marketId: Number(param0),
    accountId: accountId ? ss58.encode({ prefix: 73, bytes: accountId }) : undefined,
    market,
  };
};

export const decodeMarketDestroyedEvent = (event: Event): MarketEvent => {
  let marketId: bigint;
  if (events.predictionMarkets.marketDestroyed.v32.is(event)) {
    marketId = events.predictionMarkets.marketDestroyed.v32.decode(event);
  } else {
    [marketId] = event.args;
  }
  return {
    marketId: Number(marketId),
  };
};

export const decodeMarketDisputedEvent = (event: Event): MarketDisputedEvent => {
  let accountId: string | undefined, marketId: bigint, outcome: OutcomeReport | undefined, status: any;
  if (events.predictionMarkets.marketDisputed.v23.is(event)) {
    [marketId, outcome] = events.predictionMarkets.marketDisputed.v23.decode(event);
  } else if (events.predictionMarkets.marketDisputed.v29.is(event)) {
    let by;
    [marketId, status, { by, outcome }] = events.predictionMarkets.marketDisputed.v29.decode(event);
    accountId = by;
  } else if (events.predictionMarkets.marketDisputed.v49.is(event)) {
    [marketId, status] = events.predictionMarkets.marketDisputed.v49.decode(event);
  } else if (events.predictionMarkets.marketDisputed.v51.is(event)) {
    [marketId, status, accountId] = events.predictionMarkets.marketDisputed.v51.decode(event);
  } else {
    [marketId, status, accountId] = event.args;
  }
  return {
    marketId: Number(marketId),
    accountId,
    outcome,
  };
};

export const decodeMarketExpiredEvent = (event: Event): MarketEvent => {
  let marketId: bigint;
  if (events.predictionMarkets.marketExpired.v37.is(event)) {
    marketId = events.predictionMarkets.marketExpired.v37.decode(event);
  } else {
    [marketId] = event.args;
  }
  return {
    marketId: Number(marketId),
  };
};

export const decodeMarketInsufficientSubsidyEvent = (event: Event): MarketEvent => {
  let marketId: bigint;
  if (events.predictionMarkets.marketInsufficientSubsidy.v23.is(event)) {
    marketId = events.predictionMarkets.marketInsufficientSubsidy.v23.decode(event);
  } else if (events.predictionMarkets.marketInsufficientSubsidy.v29.is(event)) {
    [marketId] = events.predictionMarkets.marketInsufficientSubsidy.v29.decode(event);
  } else {
    [marketId] = event.args;
  }
  return {
    marketId: Number(marketId),
  };
};

export const decodeMarketRejectedEvent = (event: Event): MarketRejectedEvent => {
  let marketId: bigint, reason: string | undefined;
  if (events.predictionMarkets.marketRejected.v23.is(event)) {
    marketId = events.predictionMarkets.marketRejected.v23.decode(event);
  } else if (events.predictionMarkets.marketRejected.v41.is(event)) {
    [marketId, reason] = events.predictionMarkets.marketRejected.v41.decode(event);
  } else {
    [marketId, reason] = event.args;
  }
  return {
    marketId: Number(marketId),
    reason,
  };
};

export const decodeMarketReportedEvent = (event: Event): MarketReportedEvent => {
  let marketId: bigint,
    status: MarketStatus | undefined,
    report: any = {};
  if (events.predictionMarkets.marketReported.v23.is(event)) {
    [marketId, report.outcome] = events.predictionMarkets.marketReported.v23.decode(event);
  } else if (events.predictionMarkets.marketReported.v29.is(event)) {
    [marketId, status, report] = events.predictionMarkets.marketReported.v29.decode(event);
  } else {
    [marketId, status, report] = event.args;
  }
  return {
    marketId: Number(marketId),
    at: report.at ? +report.at.toString() : undefined,
    by: report.by ? ss58.encode({ prefix: 73, bytes: report.by }) : undefined,
    outcome: report.outcome,
  };
};

export const decodeMarketResolvedEvent = (event: Event): MarketResolvedEvent => {
  let marketId: bigint, status: MarketStatus | undefined, report: any;
  if (events.predictionMarkets.marketResolved.v23.is(event)) {
    let outcome;
    [marketId, outcome] = events.predictionMarkets.marketResolved.v23.decode(event);
    report.value = outcome;
  } else if (events.predictionMarkets.marketResolved.v29.is(event)) {
    [marketId, status, report] = events.predictionMarkets.marketResolved.v29.decode(event);
  } else {
    [marketId, status, report] = event.args;
  }
  return {
    marketId: Number(marketId),
    report,
  };
};

export const decodeMarketStartedWithSubsidyEvent = (event: Event): MarketEvent => {
  let marketId: bigint;
  if (events.predictionMarkets.marketStartedWithSubsidy.v23.is(event)) {
    marketId = events.predictionMarkets.marketStartedWithSubsidy.v23.decode(event);
  } else if (events.predictionMarkets.marketStartedWithSubsidy.v29.is(event)) {
    [marketId] = events.predictionMarkets.marketStartedWithSubsidy.v29.decode(event);
  } else {
    [marketId] = event.args;
  }
  return {
    marketId: Number(marketId),
  };
};

export const decodeRedeemSharesCall = (call: Call): MarketEvent => {
  let marketId: bigint;
  if (calls.predictionMarkets.redeemShares.v23.is(call)) {
    marketId = calls.predictionMarkets.redeemShares.v23.decode(call).marketId;
  } else {
    marketId = call.args.marketId;
  }
  return { marketId: Number(marketId) };
};

export const decodeSoldCompleteSetEvent = (event: Event): CompleteSetEvent => {
  let marketId: bigint, amount: bigint, accountId: string;
  if (events.predictionMarkets.soldCompleteSet.v23.is(event)) {
    [marketId, accountId] = events.predictionMarkets.soldCompleteSet.v23.decode(event);
    amount = BigInt(0);
  } else if (events.predictionMarkets.soldCompleteSet.v34.is(event)) {
    [marketId, amount, accountId] = events.predictionMarkets.soldCompleteSet.v34.decode(event);
  } else {
    [marketId, amount, accountId] = event.args;
  }
  return {
    marketId: Number(marketId),
    amount: BigInt(amount),
    accountId: ss58.encode({ prefix: 73, bytes: accountId }),
  };
};

export const decodeTokensRedeemedEvent = (event: Event): TokensRedeemedEvent => {
  let marketId: bigint, assetId: any, amountRedeemed: bigint, payout: bigint, accountId: string;
  if (events.predictionMarkets.tokensRedeemed.v35.is(event)) {
    [marketId, assetId, amountRedeemed, payout, accountId] = events.predictionMarkets.tokensRedeemed.v35.decode(event);
  } else if (events.predictionMarkets.tokensRedeemed.v41.is(event)) {
    [marketId, assetId, amountRedeemed, payout, accountId] = events.predictionMarkets.tokensRedeemed.v41.decode(event);
  } else {
    [marketId, assetId, amountRedeemed, payout, accountId] = event.args;
  }
  return {
    marketId: Number(marketId),
    assetId: formatAssetId(assetId),
    amountRedeemed: BigInt(amountRedeemed),
    payout: BigInt(payout),
    accountId: ss58.encode({ prefix: 73, bytes: accountId }),
  };
};

interface CompleteSetEvent {
  marketId: number;
  amount: bigint;
  accountId: string;
}

interface MarketEvent {
  marketId: number;
}

interface MarketCreatedEvent {
  marketId: number;
  accountId?: string;
  market: any;
}

interface MarketDisputedEvent {
  marketId: number;
  accountId?: string;
  outcome?: OutcomeReport;
}

interface MarketRejectedEvent {
  marketId: number;
  reason?: string;
}

interface MarketReportedEvent {
  marketId: number;
  at?: number;
  by?: string;
  outcome: OutcomeReport;
}

interface MarketResolvedEvent {
  marketId: number;
  report: OutcomeReport;
}

interface TokensRedeemedEvent {
  marketId: number;
  assetId: string;
  amountRedeemed: bigint;
  payout: bigint;
  accountId: string;
}
