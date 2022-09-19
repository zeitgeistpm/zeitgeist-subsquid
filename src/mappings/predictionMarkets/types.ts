import { encodeAddress } from '@polkadot/keyring'
import { EventHandlerContext } from '@subsquid/substrate-processor'
import * as ss58 from '@subsquid/ss58'
import { Store } from '@subsquid/typeorm-store'
import { PredictionMarketsBoughtCompleteSetEvent, PredictionMarketsMarketApprovedEvent, PredictionMarketsMarketClosedEvent, 
  PredictionMarketsMarketDisputedEvent, PredictionMarketsMarketExpiredEvent, PredictionMarketsMarketInsufficientSubsidyEvent, 
  PredictionMarketsMarketRejectedEvent, PredictionMarketsMarketReportedEvent, PredictionMarketsMarketResolvedEvent, 
  PredictionMarketsMarketStartedWithSubsidyEvent, PredictionMarketsSoldCompleteSetEvent, PredictionMarketsTokensRedeemedEvent 
} from '../../types/events'
import { EventContext } from '../../types/support'
import { MarketDispute, OutcomeReport, Report } from '../../types/v29'
import { getAssetId } from '../helper'


export function getBoughtCompleteSetEvent(ctx: EventContext): BoughtCompleteSetEvent {
  const boughtCompleteSetEvent = new PredictionMarketsBoughtCompleteSetEvent(ctx)
  if (boughtCompleteSetEvent.isV23) {
    const [mId, accountId] = boughtCompleteSetEvent.asV23
    const marketId = Number(mId)
    const amount = BigInt(0)
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return {marketId, amount, walletId}
  } else if (boughtCompleteSetEvent.isV34) {
    const [mId, amount, accountId] = boughtCompleteSetEvent.asV34
    const marketId = Number(mId)
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return {marketId, amount, walletId}
  } else {
    const [mId, amount, accountId] = ctx.event.args
    const marketId = Number(mId)
    const walletId = encodeAddress(accountId, 73)
    return {marketId, amount, walletId}
  }
}

export function getMarketApprovedEvent(ctx: EventContext): MarketApprovedEvent {
  const marketApprovedEvent = new PredictionMarketsMarketApprovedEvent(ctx)
  if (marketApprovedEvent.isV23) {
    const mId = marketApprovedEvent.asV23
    const marketId = Number(mId)
    const status = ""
    return {marketId, status}
  } else if (marketApprovedEvent.isV29) {
    const [mId, marketStatus] = marketApprovedEvent.asV29
    const marketId = Number(mId)
    const status = marketStatus.__kind
    return {marketId, status}
  } else {
    const [mId, marketStatus] = ctx.event.args
    const marketId = Number(mId)
    const status = marketStatus.__kind
    return {marketId, status}
  }
}

export function getMarketClosedEvent(ctx: EventContext): MarketClosedEvent {
  const event = new PredictionMarketsMarketClosedEvent(ctx)
  if (event.isV37) {
    const marketId = Number(event.asV37)
    return {marketId}
  } else {
    const marketId = Number(ctx.event.args)
    return {marketId}
  }
}

export function getMarketCreatedEvent(ctx: EventHandlerContext<Store, {event: {args: true}}>): MarketCreatedEvent {
  const [marketId, param1, param2] = ctx.event.args
  const specVersion = +ctx.block.specId.substring(ctx.block.specId.indexOf('@')+1)
  if (specVersion < 32) {
    const marketAccountId = ""
    let market = param1 as any
    market.disputeMechanism = market.mdm
    market.period.start = market.period.value[0]
    market.period.end = market.period.value[1]
    return { marketId, marketAccountId, market } 
  } else if (specVersion < 36 ) {
    const marketAccountId = ""
    let market = param1 as any
    market.disputeMechanism = market.mdm
    market.period.start = market.period.value.start
    market.period.end = market.period.value.end
    return { marketId, marketAccountId, market }
  } else if (specVersion < 38) {
    const marketAccountId = encodeAddress(param1, 73)
    const market = param2 as any
    market.disputeMechanism = market.mdm
    market.period.start = market.period.value.start
    market.period.end = market.period.value.end
    return { marketId, marketAccountId, market }
  } else {
    const marketAccountId = encodeAddress(param1, 73)
    const market = param2 as any
    market.period.start = param2.period.value.start
    market.period.end = market.period.value.end
    return { marketId, marketAccountId, market }
  }
}

export function getMarketDisputedEvent(ctx: EventContext): MarketDisputedEvent {
  const marketDisputedEvent = new PredictionMarketsMarketDisputedEvent(ctx)
  if (marketDisputedEvent.isV23) {
    const [mId, dispute] = marketDisputedEvent.asV23
    let report = {} as any
    const marketId = Number(mId)
    const status = ""
    report.outcome = dispute
    return {marketId, status, report}
  } else if (marketDisputedEvent.isV29) {
    const [mId, marketStatus, report] = marketDisputedEvent.asV29
    const marketId = Number(mId)
    const status = marketStatus.__kind
    return {marketId, status, report}
  } else {
    const [mId, marketStatus, report] = ctx.event.args
    const marketId = Number(mId)
    const status = marketStatus.__kind
    return {marketId, status, report}
  }
}

export function getMarketExpiredEvent(ctx: EventContext): MarketExpiredEvent {
  const event = new PredictionMarketsMarketExpiredEvent(ctx)
  if (event.isV37) {
    const marketId = Number(event.asV37)
    return {marketId}
  } else {
    const marketId = Number(ctx.event.args)
    return {marketId}
  }
}

export function getMarketInsufficientSubsidyEvent(ctx: EventContext): MarketInsufficientSubsidyEvent {
  const marketInsufficientSubsidyEvent = new PredictionMarketsMarketInsufficientSubsidyEvent(ctx)
  if (marketInsufficientSubsidyEvent.isV23) {
    const marketId = Number(marketInsufficientSubsidyEvent.asV23)
    const status = ""
    return {marketId, status}
  } else if (marketInsufficientSubsidyEvent.isV29) {
    const [mId, marketStatus] = marketInsufficientSubsidyEvent.asV29
    const marketId = Number(mId)
    const status = marketStatus.__kind
    return {marketId, status}
  } else {
    const [mId, marketStatus] = ctx.event.args
    const marketId = Number(mId)
    const status = marketStatus.__kind
    return {marketId, status}
  }
}

export function getMarketRejectedEvent(ctx: EventContext): MarketRejectedEvent {
  const marketRejectedEvent = new PredictionMarketsMarketRejectedEvent(ctx)
  if (marketRejectedEvent.isV23) {
    const marketId = Number(marketRejectedEvent.asV23)
    return {marketId}
  } else {
    const [mId] = ctx.event.args
    const marketId = Number(mId)
    return {marketId}
  }
}

export function getMarketReportedEvent(ctx: EventContext): MarketReportedEvent {
  const marketReportedEvent = new PredictionMarketsMarketReportedEvent(ctx)
  if (marketReportedEvent.isV23) {
    const [mId, marketReport] = marketReportedEvent.asV23
    let report = {} as any
    const marketId = Number(mId)
    const status = ""
    report.outcome = marketReport
    return {marketId, status, report}
  } else if (marketReportedEvent.isV29) {
    const [mId, marketStatus, report] = marketReportedEvent.asV29
    const marketId = Number(mId)
    const status = marketStatus.__kind
    return {marketId, status, report}
  } else {
    const [mId, marketStatus, report] = ctx.event.args
    const marketId = Number(mId)
    const status = marketStatus.__kind
    return {marketId, status, report}
  }
}

export function getMarketResolvedEvent(ctx: EventContext): MarketResolvedEvent {
  const marketResolvedEvent = new PredictionMarketsMarketResolvedEvent(ctx)
  if (marketResolvedEvent.isV23) {
    const [mId, outcome] = marketResolvedEvent.asV23
    let report = {} as any
    const marketId = Number(mId)
    const status = ""
    report.value = outcome
    return {marketId, status, report}
  } else if (marketResolvedEvent.isV29) {
    const [mId, marketStatus, report] = marketResolvedEvent.asV29
    const marketId = Number(mId)
    const status = marketStatus.__kind
    return {marketId, status, report}
  } else {
    const [mId, marketStatus, report] = ctx.event.args
    const marketId = Number(mId)
    const status = marketStatus.__kind
    return {marketId, status, report}
  }
}

export function getMarketStartedWithSubsidyEvent(ctx: EventContext): MarketStartedWithSubsidyEvent {
  const marketStartedWithSubsidyEvent = new PredictionMarketsMarketStartedWithSubsidyEvent(ctx)
  if (marketStartedWithSubsidyEvent.isV23) {
    const marketId = Number(marketStartedWithSubsidyEvent.asV23)
    const status = ""
    return {marketId, status}
  } else if (marketStartedWithSubsidyEvent.isV29) {
    const [mId, marketStatus] = marketStartedWithSubsidyEvent.asV29
    const marketId = Number(mId)
    const status = marketStatus.__kind
    return {marketId, status}
  } else {
    const [mId, marketStatus] = ctx.event.args
    const marketId = Number(mId)
    const status = marketStatus.__kind
    return {marketId, status}
  }
}

export function getSoldCompleteSetEvent(ctx: EventContext): SoldCompleteSetEvent {
  const soldCompleteSetEvent = new PredictionMarketsSoldCompleteSetEvent(ctx)
  if (soldCompleteSetEvent.isV23) {
    const [mId, accountId] = soldCompleteSetEvent.asV23
    const marketId = Number(mId)
    const amount = BigInt(0)
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return {marketId, amount, walletId}
  } else if (soldCompleteSetEvent.isV34) {
    const [mId, amount, accountId] = soldCompleteSetEvent.asV34
    const marketId = Number(mId)
    const walletId = ss58.codec('zeitgeist').encode(accountId)
    return {marketId, amount, walletId}
  } else {
    const [mId, amount, accountId] = ctx.event.args
    const marketId = Number(mId)
    const walletId = encodeAddress(accountId, 73)
    return {marketId, amount, walletId}
  }
}

export function getTokensRedeemedEvent(ctx: EventContext): TokensRedeemedEvent {
  const tokensRedeemedEvent = new PredictionMarketsTokensRedeemedEvent(ctx)
  let mId, marketId, currencyId, amtRedeemed, payout, who, walletId
  if (tokensRedeemedEvent.isV35) {
    [mId, currencyId, amtRedeemed, payout, who] = tokensRedeemedEvent.asV35
    marketId = Number(mId)
    walletId = ss58.codec('zeitgeist').encode(who)
  } else {
    [mId, currencyId, amtRedeemed, payout, who] = ctx.event.args
    marketId = Number(mId)
    walletId = ss58.codec('zeitgeist').encode(who)
  }
  const assetId = getAssetId(currencyId)
  return {marketId, assetId, amtRedeemed, payout, walletId}
}

interface BoughtCompleteSetEvent {
  marketId: number
  amount: bigint
  walletId: string
}

interface MarketApprovedEvent {
  marketId: number
  status: string
}

interface MarketClosedEvent {
  marketId: number
}

interface MarketCreatedEvent {
  marketId: string
  marketAccountId: string
  market: any
}

interface MarketDisputedEvent {
  marketId: number
  status: string
  report: MarketDispute
}

interface MarketExpiredEvent {
  marketId: number
}

interface MarketInsufficientSubsidyEvent {
  marketId: number
  status: string
}

interface MarketRejectedEvent {
  marketId: number
}

interface MarketReportedEvent {
  marketId: number
  status: string
  report: Report
}

interface MarketResolvedEvent {
  marketId: number
  status: string
  report: OutcomeReport
}

interface MarketStartedWithSubsidyEvent {
  marketId: number
  status: string
}

interface SoldCompleteSetEvent {
  marketId: number
  amount: bigint
  walletId: string
}

interface TokensRedeemedEvent {
  marketId: number
  assetId: string
  amtRedeemed: bigint
  payout: bigint
  walletId: string
}