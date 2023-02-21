import { encodeAddress } from '@polkadot/keyring';
import * as ss58 from '@subsquid/ss58';
import { Ctx, EventItem } from '../../processor';
import {
  PredictionMarketsBoughtCompleteSetEvent,
  PredictionMarketsMarketApprovedEvent,
  PredictionMarketsMarketClosedEvent,
  PredictionMarketsMarketCreatedEvent,
  PredictionMarketsMarketDestroyedEvent,
  PredictionMarketsMarketDisputedEvent,
  PredictionMarketsMarketExpiredEvent,
  PredictionMarketsMarketInsufficientSubsidyEvent,
  PredictionMarketsMarketRejectedEvent,
  PredictionMarketsMarketReportedEvent,
  PredictionMarketsMarketResolvedEvent,
  PredictionMarketsMarketStartedWithSubsidyEvent,
  PredictionMarketsSoldCompleteSetEvent,
  PredictionMarketsTokensRedeemedEvent,
} from '../../types/events';
import { MarketDispute, OutcomeReport, Report } from '../../types/v29';
import { MarketStatus } from '../../types/v42';
import { getAssetId } from '../helper';

export const getBoughtCompleteSetEvent = (ctx: Ctx, item: EventItem): BoughtCompleteSetEvent => {
  const event = new PredictionMarketsBoughtCompleteSetEvent(ctx, item.event);
  if (event.isV23) {
    const [mId, accountId] = event.asV23;
    const marketId = Number(mId);
    const amount = BigInt(0);
    const walletId = ss58.codec('zeitgeist').encode(accountId);
    return { marketId, amount, walletId };
  } else if (event.isV34) {
    const [mId, amount, accountId] = event.asV34;
    const marketId = Number(mId);
    const walletId = ss58.codec('zeitgeist').encode(accountId);
    return { marketId, amount, walletId };
  } else {
    const [mId, amount, accountId] = item.event.args;
    const marketId = Number(mId);
    const walletId = encodeAddress(accountId, 73);
    return { marketId, amount, walletId };
  }
};

export const getMarketApprovedEvent = (ctx: Ctx, item: EventItem): MarketApprovedEvent => {
  const event = new PredictionMarketsMarketApprovedEvent(ctx, item.event);
  if (event.isV23) {
    const mId = event.asV23;
    const marketId = Number(mId);
    return { marketId };
  } else if (event.isV29) {
    const [mId, status] = event.asV29;
    const marketId = Number(mId);
    return { marketId, status };
  } else {
    const [mId, status] = item.event.args;
    const marketId = Number(mId);
    return { marketId, status };
  }
};

export const getMarketClosedEvent = (ctx: Ctx, item: EventItem): MarketClosedEvent => {
  const event = new PredictionMarketsMarketClosedEvent(ctx, item.event);
  if (event.isV37) {
    const marketId = Number(event.asV37);
    return { marketId };
  } else {
    const marketId = Number(item.event.args);
    return { marketId };
  }
};

export const getMarketCreatedEvent = (ctx: Ctx, item: EventItem): MarketCreatedEvent => {
  const event = new PredictionMarketsMarketCreatedEvent(ctx, item.event);
  const [marketId, param1, param2] = item.event.args;
  if (event.isV23 || event.isV29) {
    const marketAccountId = '';
    let market = param1 as any;
    market.disputeMechanism = market.mdm;
    market.period.start = market.period.value[0];
    market.period.end = market.period.value[1];
    return { marketId, marketAccountId, market };
  } else if (event.isV32) {
    const marketAccountId = '';
    let market = param1 as any;
    market.disputeMechanism = market.mdm;
    market.period.start = market.period.value.start;
    market.period.end = market.period.value.end;
    return { marketId, marketAccountId, market };
  } else if (event.isV36) {
    const marketAccountId = encodeAddress(param1, 73);
    const market = param2 as any;
    market.disputeMechanism = market.mdm;
    market.period.start = market.period.value.start;
    market.period.end = market.period.value.end;
    return { marketId, marketAccountId, market };
  } else if (event.isV38 || event.isV40 || event.isV41 || event.isV42) {
    const marketAccountId = encodeAddress(param1, 73);
    const market = param2 as any;
    market.period.start = market.period.value.start;
    market.period.end = market.period.value.end;
    return { marketId, marketAccountId, market };
  } else {
    const marketAccountId = encodeAddress(param1, 73);
    const market = param2 as any;
    market.period.start = param2.period.value.start;
    market.period.end = market.period.value.end;
    return { marketId, marketAccountId, market };
  }
};

export const getMarketDestroyedEvent = (ctx: Ctx, item: EventItem): MarketDestroyedEvent => {
  const event = new PredictionMarketsMarketDestroyedEvent(ctx, item.event);
  if (event.isV32) {
    const marketId = Number(event.asV32);
    return { marketId };
  } else {
    const marketId = Number(item.event.args);
    return { marketId };
  }
};

export const getMarketDisputedEvent = (ctx: Ctx, item: EventItem): MarketDisputedEvent => {
  const event = new PredictionMarketsMarketDisputedEvent(ctx, item.event);
  if (event.isV23) {
    const [mId, dispute] = event.asV23;
    let report = {} as any;
    const marketId = Number(mId);
    report.outcome = dispute;
    return { marketId, report };
  } else if (event.isV29) {
    const [mId, status, report] = event.asV29;
    const marketId = Number(mId);
    return { marketId, status, report };
  } else {
    const [mId, status, report] = item.event.args;
    const marketId = Number(mId);
    return { marketId, status, report };
  }
};

export const getMarketExpiredEvent = (ctx: Ctx, item: EventItem): MarketExpiredEvent => {
  const event = new PredictionMarketsMarketExpiredEvent(ctx, item.event);
  if (event.isV37) {
    const marketId = Number(event.asV37);
    return { marketId };
  } else {
    const marketId = Number(item.event.args);
    return { marketId };
  }
};

export const getMarketInsufficientSubsidyEvent = (ctx: Ctx, item: EventItem): MarketSubsidyEvent => {
  const event = new PredictionMarketsMarketInsufficientSubsidyEvent(ctx, item.event);
  if (event.isV23) {
    const marketId = Number(event.asV23);
    return { marketId };
  } else if (event.isV29) {
    const [mId, status] = event.asV29;
    const marketId = Number(mId);
    return { marketId, status };
  } else {
    const [mId, status] = item.event.args;
    const marketId = Number(mId);
    return { marketId, status };
  }
};

export const getMarketRejectedEvent = (ctx: Ctx, item: EventItem): MarketRejectedEvent => {
  const event = new PredictionMarketsMarketRejectedEvent(ctx, item.event);
  if (event.isV23) {
    const marketId = Number(event.asV23);
    const reason = new Uint8Array(0);
    return { marketId, reason };
  } else if (event.isV41) {
    const [mId, reason] = event.asV41;
    const marketId = Number(mId);
    return { marketId, reason };
  } else {
    const [mId, reason] = item.event.args;
    const marketId = Number(mId);
    return { marketId, reason };
  }
};

export const getMarketReportedEvent = (ctx: Ctx, item: EventItem): MarketReportedEvent => {
  const event = new PredictionMarketsMarketReportedEvent(ctx, item.event);
  if (event.isV23) {
    const [mId, marketReport] = event.asV23;
    let report = {} as any;
    const marketId = Number(mId);
    report.outcome = marketReport;
    return { marketId, report };
  } else if (event.isV29) {
    const [mId, status, report] = event.asV29;
    const marketId = Number(mId);
    return { marketId, status, report };
  } else {
    const [mId, status, report] = item.event.args;
    const marketId = Number(mId);
    return { marketId, status, report };
  }
};

export const getMarketResolvedEvent = (ctx: Ctx, item: EventItem): MarketResolvedEvent => {
  const event = new PredictionMarketsMarketResolvedEvent(ctx, item.event);
  if (event.isV23) {
    const [mId, outcome] = event.asV23;
    let report = {} as any;
    const marketId = Number(mId);
    report.value = outcome;
    return { marketId, report };
  } else if (event.isV29) {
    const [mId, status, report] = event.asV29;
    const marketId = Number(mId);
    return { marketId, status, report };
  } else {
    const [mId, status, report] = item.event.args;
    const marketId = Number(mId);
    return { marketId, status, report };
  }
};

export const getMarketStartedWithSubsidyEvent = (ctx: Ctx, item: EventItem): MarketSubsidyEvent => {
  const event = new PredictionMarketsMarketStartedWithSubsidyEvent(ctx, item.event);
  if (event.isV23) {
    const marketId = Number(event.asV23);
    return { marketId };
  } else if (event.isV29) {
    const [mId, status] = event.asV29;
    const marketId = Number(mId);
    return { marketId, status };
  } else {
    const [mId, status] = item.event.args;
    const marketId = Number(mId);
    return { marketId, status };
  }
};

export const getSoldCompleteSetEvent = (ctx: Ctx, item: EventItem): SoldCompleteSetEvent => {
  const event = new PredictionMarketsSoldCompleteSetEvent(ctx, item.event);
  if (event.isV23) {
    const [mId, accountId] = event.asV23;
    const marketId = Number(mId);
    const amount = BigInt(0);
    const walletId = ss58.codec('zeitgeist').encode(accountId);
    return { marketId, amount, walletId };
  } else if (event.isV34) {
    const [mId, amount, accountId] = event.asV34;
    const marketId = Number(mId);
    const walletId = ss58.codec('zeitgeist').encode(accountId);
    return { marketId, amount, walletId };
  } else {
    const [mId, amount, accountId] = item.event.args;
    const marketId = Number(mId);
    const walletId = encodeAddress(accountId, 73);
    return { marketId, amount, walletId };
  }
};

export const getTokensRedeemedEvent = (ctx: Ctx, item: EventItem): TokensRedeemedEvent => {
  const event = new PredictionMarketsTokensRedeemedEvent(ctx, item.event);
  let mId, marketId, currencyId, amtRedeemed, payout, who, walletId;
  if (event.isV35) {
    [mId, currencyId, amtRedeemed, payout, who] = event.asV35;
    marketId = Number(mId);
    walletId = ss58.codec('zeitgeist').encode(who);
  } else if (event.isV41) {
    [mId, currencyId, amtRedeemed, payout, who] = event.asV41;
    marketId = Number(mId);
    walletId = ss58.codec('zeitgeist').encode(who);
  } else {
    [mId, currencyId, amtRedeemed, payout, who] = item.event.args;
    marketId = Number(mId);
    walletId = ss58.codec('zeitgeist').encode(who);
  }
  const assetId = getAssetId(currencyId);
  return { marketId, assetId, amtRedeemed, payout, walletId };
};

interface BoughtCompleteSetEvent {
  marketId: number;
  amount: bigint;
  walletId: string;
}

interface MarketApprovedEvent {
  marketId: number;
  status?: MarketStatus;
}

interface MarketClosedEvent {
  marketId: number;
}

interface MarketCreatedEvent {
  marketId: string;
  marketAccountId: string;
  market: any;
}

interface MarketDestroyedEvent {
  marketId: number;
}

interface MarketDisputedEvent {
  marketId: number;
  status?: MarketStatus;
  report: MarketDispute;
}

interface MarketExpiredEvent {
  marketId: number;
}

interface MarketRejectedEvent {
  marketId: number;
  reason: Uint8Array;
}

interface MarketReportedEvent {
  marketId: number;
  status?: MarketStatus;
  report: Report;
}

interface MarketResolvedEvent {
  marketId: number;
  status?: MarketStatus;
  report: OutcomeReport;
}

interface MarketSubsidyEvent {
  marketId: number;
  status?: MarketStatus;
}

interface SoldCompleteSetEvent {
  marketId: number;
  amount: bigint;
  walletId: string;
}

interface TokensRedeemedEvent {
  marketId: number;
  assetId: string;
  amtRedeemed: bigint;
  payout: bigint;
  walletId: string;
}
